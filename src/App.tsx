/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Image as ImageIcon, SlidersHorizontal, Trash2, Download, Maximize, RefreshCw, Scissors, Check, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import Cropper, { Area } from 'react-easy-crop';
import { getCroppedImg } from './lib/getCroppedImg';

interface MockupArea {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface MockupTemplate {
  id: string;
  name: string;
  imageUrl: string;
  area: MockupArea;
  defaultBlendMode?: 'normal' | 'multiply';
}

const TEMPLATES: MockupTemplate[] = [
  {
    id: 'tshirt-white',
    name: 'White T-Shirt',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    area: { top: 35, left: 35, width: 30, height: 30 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'mug-white',
    name: 'Ceramic Mug',
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80',
    area: { top: 30, left: 16, width: 35, height: 42 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'tote-bag',
    name: 'Canvas Tote Bag',
    imageUrl: 'https://images.unsplash.com/photo-1597339891040-410a56ebdf22?auto=format&fit=crop&w=800&q=80',
    area: { top: 40, left: 30, width: 40, height: 40 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'hoodie-blank',
    name: 'Blank Hoodie',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    area: { top: 35, left: 35, width: 30, height: 25 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'cap',
    name: 'Classic Cap',
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    area: { top: 20, left: 38, width: 24, height: 24 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'tshirt-black',
    name: 'Black T-Shirt',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    area: { top: 35, left: 35, width: 30, height: 30 },
    defaultBlendMode: 'normal'
  },
  {
    id: 'coffee-cup',
    name: 'Coffee Paper Cup',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    area: { top: 45, left: 35, width: 30, height: 30 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'phone-case',
    name: 'Clear Phone Case',
    imageUrl: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=800&q=80',
    area: { top: 30, left: 30, width: 40, height: 40 },
    defaultBlendMode: 'normal'
  },
  {
    id: 'laptop-sticker',
    name: 'Laptop Sticker',
    imageUrl: 'https://images.unsplash.com/photo-1589831377283-33cb1cc6bd5d?auto=format&fit=crop&w=800&q=80',
    area: { top: 35, left: 35, width: 30, height: 30 },
    defaultBlendMode: 'normal'
  },
  {
    id: 'enamel-mug',
    name: 'Enamel Camp Mug',
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80', // Same mug different style placeholder
    area: { top: 30, left: 16, width: 35, height: 42 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'phone-case-silicone',
    name: 'Silicone Phone Case',
    imageUrl: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80',
    area: { top: 35, left: 35, width: 30, height: 30 },
    defaultBlendMode: 'normal'
  },
  {
    id: 'bumper-sticker',
    name: 'Bumper Sticker',
    imageUrl: 'https://images.unsplash.com/photo-1589831377283-33cb1cc6bd5d?auto=format&fit=crop&w=800&q=80', // Same sticker different style placeholder
    area: { top: 40, left: 30, width: 40, height: 20 },
    defaultBlendMode: 'normal'
  }
];

export default function App() {
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [uncroppedImage, setUncroppedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Customization state
  const [logoScale, setLogoScale] = useState(1);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [blendMode, setBlendMode] = useState<'normal' | 'multiply' | 'auto'>('auto');
  const [bgPattern, setBgPattern] = useState<'none' | 'checkerboard' | 'stripes'>('none');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = TEMPLATES.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
  const activeTemplate = hoveredTemplateId ? (TEMPLATES.find(t => t.id === hoveredTemplateId) || selectedTemplate) : selectedTemplate;

  useEffect(() => {
    if (searchQuery && filteredTemplates.length > 0) {
      if (!filteredTemplates.some(t => t.id === selectedTemplateId)) {
        setSelectedTemplateId(filteredTemplates[0].id);
      }
    }
  }, [searchQuery, filteredTemplates, selectedTemplateId]);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setUncroppedImage(e.target.result);
          setIsCropping(true);
          // Only reset crop settings when starting a new crop
          setCrop({ x: 0, y: 0 });
          setZoom(1);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file (PNG, JPG, SVG).');
    }
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      if (uncroppedImage && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(uncroppedImage, croppedAreaPixels);
        setLogoBase64(croppedImage);
        setIsCropping(false);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to crop image');
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    if (!logoBase64) {
      setUncroppedImage(null);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const removeLogo = () => {
    setLogoBase64(null);
    setUncroppedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Mockup Magic</h1>
          </div>
          {logoBase64 && (
            <button 
              onClick={removeLogo}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Remove Logo</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Controls / Uploader section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className={`${logoBase64 ? 'lg:col-span-4' : 'lg:col-span-12'} transition-all duration-500`}>
            {isCropping && uncroppedImage ? (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200 flex flex-col h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                    <Scissors className="w-4 h-4" /> Crop Image
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={handleCropCancel} className="p-1 px-3 text-sm text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md">
                      Cancel
                    </button>
                    <button onClick={handleCropSave} className="p-1 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1">
                      <Check className="w-4 h-4" /> Apply
                    </button>
                  </div>
                </div>
                <div className="relative flex-1 w-full bg-neutral-900 rounded-2xl overflow-hidden">
                  <Cropper
                    image={uncroppedImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="mt-4">
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            ) : !logoBase64 ? (
              <motion.div 
                layoutId="upload-zone"
                className={`
                  h-64 sm:h-96 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 bg-white hover:border-blue-400 hover:bg-neutral-50'}
                `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={handleUploadClick}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleInputChange}
                />
                <div className="w-20 h-20 mb-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Upload className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload your logo</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                  Drag and drop your design here, or click to browse. For best results, use a transparent PNG or SVG.
                </p>
              </motion.div>
            ) : (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200 flex flex-col h-full space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Current Logo
                    </h3>
                    {uncroppedImage && (
                      <button 
                        onClick={() => setIsCropping(true)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Scissors className="w-3 h-3" /> Re-crop
                      </button>
                    )}
                  </div>
                  <div className="aspect-square w-32 mx-auto bg-neutral-100 rounded-2xl border border-neutral-200 p-4 flex items-center justify-center overflow-hidden relative checkerboard-bg">
                    <img src={logoBase64} alt="Uploaded Logo" className="max-w-full max-h-full object-contain drop-shadow-sm" />
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" /> Adjustments
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <label className="font-medium text-neutral-700">Scale</label>
                        <span className="text-neutral-500">{Math.round(logoScale * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.2" max="2" step="0.05"
                        value={logoScale}
                        onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <label className="font-medium text-neutral-700">Opacity</label>
                        <span className="text-neutral-500">{Math.round(logoOpacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" max="1" step="0.05"
                        value={logoOpacity}
                        onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-700 block mb-2">Blend Mode</label>
                      <div className="flex bg-neutral-100 p-1 rounded-lg">
                        {['auto', 'normal', 'multiply'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setBlendMode(mode as any)}
                            className={`flex-1 text-xs font-medium px-3 py-2 rounded-md capitalize transition-all ${
                              blendMode === mode ? 'bg-white shadow-sm text-blue-700' : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-neutral-500 mt-2">
                        Multiply works best on light colors to keep fabric texture. Normal is better for dark items.
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-700 block mb-2">Base Image Pattern</label>
                      <div className="flex bg-neutral-100 p-1 rounded-lg">
                        {['none', 'checkerboard', 'stripes'].map((pattern) => (
                          <button
                            key={pattern}
                            onClick={() => setBgPattern(pattern as any)}
                            className={`flex-1 text-xs font-medium px-3 py-2 rounded-md capitalize transition-all ${
                              bgPattern === pattern ? 'bg-white shadow-sm text-blue-700' : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            {pattern}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {logoBase64 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-8 flex flex-col space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold tracking-tight">Product Preview</h2>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto z-20">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Search mockups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-48 pl-9 pr-4 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div className="relative inline-block w-full sm:w-auto">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full sm:w-56 flex items-center justify-between bg-white border border-neutral-300 text-neutral-700 py-2 pl-4 pr-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium shadow-sm"
                      >
                        <span className="truncate">{selectedTemplate.name}</span>
                        <svg className="fill-current h-4 w-4 text-neutral-500 shrink-0 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </button>

                      {isDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsDropdownOpen(false)} 
                          />
                          <div className="absolute right-0 sm:right-auto z-20 mt-1 min-w-full w-48 sm:w-64 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden">
                            {filteredTemplates.length > 0 ? (
                              filteredTemplates.map((template) => (
                                <button
                                  key={template.id}
                                  onClick={() => {
                                    setSelectedTemplateId(template.id);
                                    setIsDropdownOpen(false);
                                    setHoveredTemplateId(null);
                                  }}
                                  onMouseEnter={() => setHoveredTemplateId(template.id)}
                                  onMouseLeave={() => setHoveredTemplateId(null)}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 flex items-center gap-3 transition-colors ${
                                    selectedTemplateId === template.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-neutral-700'
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded shrink-0 overflow-hidden bg-neutral-100 border border-neutral-200">
                                    <img src={template.imageUrl} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <span className="truncate">{template.name}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-neutral-500">
                                No templates found
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-2xl">
                  <MockupPreview 
                    key={activeTemplate.id} 
                    template={activeTemplate} 
                    logoData={logoBase64} 
                    logoScale={logoScale}
                    logoOpacity={logoOpacity}
                    globalBlendMode={blendMode}
                    bgPattern={bgPattern}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      <style>{`
        .checkerboard-bg {
          background-image: 
            linear-gradient(45deg, #e5e5e5 25%, transparent 25%), 
            linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #e5e5e5 75%), 
            linear-gradient(-45deg, transparent 75%, #e5e5e5 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pattern-overlay-checkerboard {
          background-image: 
            linear-gradient(45deg, #000 25%, transparent 25%), 
            linear-gradient(-45deg, #000 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #000 75%), 
            linear-gradient(-45deg, transparent 75%, #000 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        .pattern-overlay-stripes {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            #000 10px,
            #000 20px
          );
        }
      `}</style>
    </div>
  );
}

function MockupPreview({ 
  template, 
  logoData, 
  logoScale, 
  logoOpacity, 
  globalBlendMode,
  bgPattern,
  key
}: { 
  template: MockupTemplate, 
  logoData: string, 
  logoScale: number,
  logoOpacity: number,
  globalBlendMode: 'normal' | 'multiply' | 'auto',
  bgPattern: 'none' | 'checkerboard' | 'stripes',
  key?: React.Key
}) {
  const activeBlendMode = globalBlendMode === 'auto' 
    ? (template.defaultBlendMode || 'normal') 
    : globalBlendMode;
    
  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!previewRef.current) return;
    
    try {
      setIsExporting(true);
      
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High quality
      });
      
      const link = document.createElement('a');
      link.download = `mockup-${template.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting image:', err);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm flex flex-col group p-2">
      <div 
        ref={previewRef}
        className="relative w-full aspect-[4/5] bg-neutral-100 rounded-2xl overflow-hidden flex-1 select-none"
      >
        {/* Base Image */}
        <img 
          src={template.imageUrl} 
          alt={template.name} 
          className="w-full h-full object-cover transition-transform duration-700"
          crossOrigin="anonymous"
        />
        
        {/* Pattern Overlay */}
        {bgPattern !== 'none' && (
          <div 
            className={`absolute inset-0 pointer-events-none mix-blend-multiply opacity-20 ${
              bgPattern === 'checkerboard' ? 'pattern-overlay-checkerboard' : 'pattern-overlay-stripes'
            }`}
          />
        )}
        
        {/* Overlay Container matching area */}
        <div 
          className="absolute flex items-center justify-center overflow-visible"
          style={{
            top: `${template.area.top}%`,
            left: `${template.area.left}%`,
            width: `${template.area.width}%`,
            height: `${template.area.height}%`,
            mixBlendMode: activeBlendMode,
            opacity: logoOpacity
          }}
        >
          {/* Action Image */}
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: logoScale, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            src={logoData} 
            alt="Logo overlaid"
            className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
          />
        </div>
      </div>
      
      <div className="px-4 py-4 -mt-2 bg-white relative z-10 flex justify-between items-center rounded-b-2xl">
        <h4 className="font-semibold text-neutral-900">{template.name}</h4>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className={`p-2 rounded-full transition-colors flex items-center gap-2 ${
            isExporting 
              ? 'text-neutral-400 cursor-not-allowed' 
              : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
          }`}
          title="Download Mockup"
        >
          {isExporting ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
             <Download className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
