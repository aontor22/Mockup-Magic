/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Image as ImageIcon, SlidersHorizontal, Trash2, Download, Maximize, RefreshCw, Scissors, Check, X, Search, Undo2, Redo2, Save, FolderOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
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
  },
  {
    id: 'beanie',
    name: 'Knit Beanie',
    imageUrl: 'https://images.unsplash.com/photo-1576871337424-69bf88ff1a2b?auto=format&fit=crop&w=800&q=80',
    area: { top: 45, left: 40, width: 20, height: 15 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'poster',
    name: 'Framed Poster',
    imageUrl: 'https://images.unsplash.com/photo-1580136608260-4eb11f4b24fe?auto=format&fit=crop&w=800&q=80',
    area: { top: 20, left: 25, width: 50, height: 60 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'smartphone-screen',
    name: 'Smartphone Screen',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    area: { top: 15, left: 28, width: 44, height: 70 },
    defaultBlendMode: 'normal'
  },
  {
    id: 'business-cards',
    name: 'Business Cards Stack',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    area: { top: 38, left: 30, width: 40, height: 25 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'notebook',
    name: 'Spiral Notebook',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    area: { top: 25, left: 30, width: 40, height: 50 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'laptop-screen',
    name: 'Laptop Screen',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    area: { top: 15, left: 15, width: 70, height: 55 },
    defaultBlendMode: 'normal'
  },
  {
    id: 'packaging-box',
    name: 'Cardboard Box',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    area: { top: 35, left: 30, width: 40, height: 35 },
    defaultBlendMode: 'multiply'
  },
  {
    id: 'water-bottle',
    name: 'Water Bottle',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    area: { top: 30, left: 38, width: 24, height: 40 },
    defaultBlendMode: 'multiply'
  }
];

const TEXTURES = {
  none: '',
  grunge: 'https://images.unsplash.com/photo-1518063088965-dbd8e7c1eb7c?auto=format&fit=crop&w=400&q=80',
  smooth: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=400&q=80',
  embossed: 'https://images.unsplash.com/photo-1561725848-0ca1a8ea6499?auto=format&fit=crop&w=400&q=80'
};

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
  const [logoRotation, setLogoRotation] = useState(0);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [blendMode, setBlendMode] = useState<'normal' | 'multiply' | 'auto' | 'overlay' | 'difference' | 'screen'>('auto');
  const [bgPattern, setBgPattern] = useState<'none' | 'checkerboard' | 'stripes'>('none');
  const [logoTexture, setLogoTexture] = useState<'none' | 'grunge' | 'smooth' | 'embossed'>('none');
  const [textureIntensity, setTextureIntensity] = useState(0.5);
  const [logoColor, setLogoColor] = useState<string>('#000000');
  const [enableColorOverride, setEnableColorOverride] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });

  type HistoryState = {
    logoScale: number;
    logoRotation: number;
    logoOpacity: number;
    blendMode: 'normal' | 'multiply' | 'auto' | 'overlay' | 'difference' | 'screen';
    bgPattern: 'none' | 'checkerboard' | 'stripes';
    logoTexture: 'none' | 'grunge' | 'smooth' | 'embossed';
    textureIntensity: number;
    logoColor: string;
    enableColorOverride: boolean;
    selectedTemplateId: string;
    logoPosition: { x: number, y: number };
    snapToGrid: boolean;
  };

  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const [snapToGrid, setSnapToGrid] = useState(false);

  type SavedDesign = {
    id: string;
    name: string;
    timestamp: number;
    logoBase64: string | null;
    uncroppedImage: string | null;
    settings: HistoryState;
  };
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [isSavedDesignsModalOpen, setIsSavedDesignsModalOpen] = useState(false);

  useEffect(() => {
    const loaded = localStorage.getItem('savedDesigns');
    if (loaded) {
      try {
        setSavedDesigns(JSON.parse(loaded));
      } catch (e) {}
    }
  }, []);

  const handleSaveDesign = () => {
    const name = prompt('Enter a name for this design:', 'My Mockup');
    if (!name) return;

    const newDesign: SavedDesign = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name,
      timestamp: Date.now(),
      logoBase64,
      uncroppedImage,
      settings: currentState,
    };

    const updated = [newDesign, ...savedDesigns].slice(0, 50);
    try {
      localStorage.setItem('savedDesigns', JSON.stringify(updated));
      setSavedDesigns(updated);
    } catch (e) {
      alert('Failed to save design. Local storage might be full.');
    }
  };

  const loadDesign = (design: SavedDesign) => {
    setLogoBase64(design.logoBase64);
    setUncroppedImage(design.uncroppedImage);
    setLogoScale(design.settings.logoScale);
    setLogoRotation(design.settings.logoRotation);
    setLogoOpacity(design.settings.logoOpacity);
    setBlendMode(design.settings.blendMode);
    setBgPattern(design.settings.bgPattern);
    setLogoTexture(design.settings.logoTexture);
    setTextureIntensity(design.settings.textureIntensity);
    setLogoColor(design.settings.logoColor);
    setEnableColorOverride(design.settings.enableColorOverride);
    setSelectedTemplateId(design.settings.selectedTemplateId);
    setLogoPosition(design.settings.logoPosition);
    setSnapToGrid(design.settings.snapToGrid);
    
    setIsSavedDesignsModalOpen(false);
    setPast([]);
    setFuture([]);
  };

  const deleteDesign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDesigns.filter(d => d.id !== id);
    localStorage.setItem('savedDesigns', JSON.stringify(updated));
    setSavedDesigns(updated);
  };

  const currentState: HistoryState = {
    logoScale, logoRotation, logoOpacity, blendMode, bgPattern, logoTexture, textureIntensity, logoColor, enableColorOverride, selectedTemplateId, logoPosition, snapToGrid
  };

  const saveHistory = useCallback(() => {
    setPast(prev => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (
          last.logoScale === logoScale &&
          last.logoRotation === logoRotation &&
          last.logoOpacity === logoOpacity &&
          last.blendMode === blendMode &&
          last.bgPattern === bgPattern &&
          last.logoTexture === logoTexture &&
          last.textureIntensity === textureIntensity &&
          last.logoColor === logoColor &&
          last.enableColorOverride === enableColorOverride &&
          last.selectedTemplateId === selectedTemplateId &&
          last.logoPosition.x === logoPosition.x &&
          last.logoPosition.y === logoPosition.y &&
          last.snapToGrid === snapToGrid
        ) {
          return prev; // No change
        }
      }
      return [...prev, currentState];
    });
    setFuture([]);
  }, [currentState, logoScale, logoRotation, logoOpacity, blendMode, bgPattern, logoTexture, textureIntensity, logoColor, enableColorOverride, selectedTemplateId, logoPosition, snapToGrid]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(prev => prev.slice(0, -1));
    setFuture(prev => [currentState, ...prev]);
    
    setLogoScale(previous.logoScale);
    setLogoRotation(previous.logoRotation);
    setLogoOpacity(previous.logoOpacity);
    setBlendMode(previous.blendMode);
    setBgPattern(previous.bgPattern);
    setLogoTexture(previous.logoTexture);
    setTextureIntensity(previous.textureIntensity);
    setLogoColor(previous.logoColor);
    setEnableColorOverride(previous.enableColorOverride);
    setSelectedTemplateId(previous.selectedTemplateId);
    setLogoPosition(previous.logoPosition);
    setSnapToGrid(previous.snapToGrid);
    setHoveredTemplateId(null);
  }, [past, currentState]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setPast(prev => [...prev, currentState]);

    setLogoScale(next.logoScale);
    setLogoRotation(next.logoRotation);
    setLogoOpacity(next.logoOpacity);
    setBlendMode(next.blendMode);
    setBgPattern(next.bgPattern);
    setLogoTexture(next.logoTexture);
    setTextureIntensity(next.textureIntensity);
    setLogoColor(next.logoColor);
    setEnableColorOverride(next.enableColorOverride);
    setSelectedTemplateId(next.selectedTemplateId);
    setLogoPosition(next.logoPosition);
    setSnapToGrid(next.snapToGrid);
    setHoveredTemplateId(null);
  }, [future, currentState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent triggering when typing in inputs like search bar
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

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
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">Mockup Magic</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSavedDesignsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Saved Designs</span>
            </button>
            <button 
              onClick={handleSaveDesign}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
            {logoBase64 && (
              <button 
                onClick={removeLogo}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Remove Logo</span>
              </button>
            )}
          </div>
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" /> Adjustments
                    </h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={undo} disabled={past.length === 0} 
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Undo (Ctrl+Z)"
                      >
                        <Undo2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={redo} disabled={future.length === 0}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Redo (Ctrl+Shift+Z)"
                      >
                        <Redo2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <label className="font-medium text-neutral-700">Logo Color</label>
                        <label className="flex items-center space-x-2 text-sm text-neutral-500 cursor-pointer hover:text-neutral-900 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={enableColorOverride} 
                            onChange={(e) => {
                              saveHistory();
                              setEnableColorOverride(e.target.checked);
                            }} 
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <span>Override Color</span>
                        </label>
                      </div>
                      <div className={`transition-opacity duration-200 ${enableColorOverride ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded overflow-hidden border border-neutral-300 shadow-sm cursor-pointer">
                            <input 
                              type="color" 
                              value={logoColor}
                              onChange={(e) => setLogoColor(e.target.value)}
                              onPointerDown={saveHistory}
                              className="absolute -inset-2 w-14 h-14 cursor-pointer p-0 bg-transparent"
                              disabled={!enableColorOverride}
                            />
                          </div>
                          <span className="text-sm font-mono text-neutral-500 uppercase">{logoColor}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <label className="font-medium text-neutral-700">Scale</label>
                        <span className="text-neutral-500">{Math.round(logoScale * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.2" max="2" step="0.05"
                        value={logoScale}
                        onPointerDown={saveHistory}
                        onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <label className="font-medium text-neutral-700">Rotation</label>
                        <span className="text-neutral-500">{logoRotation}°</span>
                      </div>
                      <input 
                        type="range" 
                        min="-180" max="180" step="1"
                        value={logoRotation}
                        onPointerDown={saveHistory}
                        onChange={(e) => setLogoRotation(parseFloat(e.target.value))}
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
                        onPointerDown={saveHistory}
                        onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-700 block mb-2">Blend Mode</label>
                      <div className="flex flex-wrap bg-neutral-100 p-1 rounded-lg gap-1">
                        {['auto', 'normal', 'multiply', 'overlay', 'difference', 'screen'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => {
                              saveHistory();
                              setBlendMode(mode as any);
                            }}
                            className={`flex-1 min-w-[30%] text-xs font-medium px-3 py-2 rounded-md capitalize transition-all ${
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
                      <div className="flex justify-between text-sm mb-2">
                        <label className="font-medium text-neutral-700">Drag Settings</label>
                      </div>
                      <label className="flex items-center space-x-2 text-sm text-neutral-700 cursor-pointer w-fit hover:text-neutral-900 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={snapToGrid} 
                          onChange={(e) => {
                            saveHistory();
                            setSnapToGrid(e.target.checked);
                          }} 
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span>Snap to grid (finer adjustments)</span>
                      </label>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-700 block mb-2">Base Image Pattern</label>
                      <div className="flex bg-neutral-100 p-1 rounded-lg">
                        {['none', 'checkerboard', 'stripes'].map((pattern) => (
                          <button
                            key={pattern}
                            onClick={() => {
                              saveHistory();
                              setBgPattern(pattern as any);
                            }}
                            className={`flex-1 text-xs font-medium px-3 py-2 rounded-md capitalize transition-all ${
                              bgPattern === pattern ? 'bg-white shadow-sm text-blue-700' : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            {pattern}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-700 block mb-2">Logo Texture Overlay</label>
                      <div className="flex bg-neutral-100 p-1 rounded-lg mb-4">
                        {['none', 'grunge', 'smooth', 'embossed'].map((texture) => (
                          <button
                            key={texture}
                            onClick={() => {
                              saveHistory();
                              setLogoTexture(texture as any);
                            }}
                            className={`flex-1 text-xs font-medium px-2 py-2 rounded-md capitalize transition-all ${
                              logoTexture === texture ? 'bg-white shadow-sm text-blue-700' : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            {texture}
                          </button>
                        ))}
                      </div>

                      {logoTexture !== 'none' && (
                        <div className="mt-2 text-sm">
                          <div className="flex justify-between mb-2">
                            <label className="font-medium text-neutral-700">Texture Intensity</label>
                            <span className="text-neutral-500">{Math.round(textureIntensity * 100)}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="1" step="0.05"
                            value={textureIntensity}
                            onPointerDown={saveHistory}
                            onChange={(e) => setTextureIntensity(parseFloat(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>
                      )}
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
                        placeholder="Search for t-shirts, mugs, etc."
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
                                    saveHistory();
                                    setSelectedTemplateId(template.id);
                                    setLogoPosition({ x: 0, y: 0 });
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
                      logoRotation={logoRotation}
                      logoOpacity={logoOpacity}
                      logoPosition={logoPosition}
                      onPositionChange={setLogoPosition}
                      onScaleChange={setLogoScale}
                      onDragStart={saveHistory}
                      globalBlendMode={blendMode}
                      bgPattern={bgPattern}
                      logoTexture={logoTexture}
                      textureIntensity={textureIntensity}
                      logoColor={logoColor}
                      enableColorOverride={enableColorOverride}
                      snapToGrid={snapToGrid}
                      isHoveredPreview={hoveredTemplateId !== null && hoveredTemplateId === activeTemplate.id}
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
      
      {/* Saved Designs Modal */}
      {isSavedDesignsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-white sticky top-0 shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                Saved Designs
              </h2>
              <button 
                onClick={() => setIsSavedDesignsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 bg-neutral-50">
              {savedDesigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                    <FolderOpen className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">No saved designs yet</h3>
                  <p className="text-neutral-500">Save a design from the header to see it here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedDesigns.map(design => (
                    <div 
                      key={design.id} 
                      onClick={() => loadDesign(design)}
                      className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-[280px]"
                    >
                      <div className="h-40 bg-neutral-100 relative flex items-center justify-center overflow-hidden w-full shrink-0">
                        {design.logoBase64 ? (
                          <img src={design.logoBase64} alt="Design logo" className="max-w-[80%] max-h-[80%] object-contain" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-neutral-300" />
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => deleteDesign(design.id, e)}
                            className="bg-white/80 hover:bg-red-50 text-neutral-500 hover:text-red-500 p-1.5 rounded-lg backdrop-blur-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1 border-t border-neutral-100">
                        <h4 className="font-semibold text-neutral-900 truncate mb-1">{design.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(design.timestamp).toLocaleDateString()} at {new Date(design.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-auto">
                          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                          <span className="truncate">{TEMPLATES.find(t => t.id === design.settings.selectedTemplateId)?.name || 'Unknown Template'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MockupPreview({ 
  template, 
  logoData, 
  logoScale, 
  logoRotation,
  logoOpacity, 
  logoPosition,
  onPositionChange,
  onDragStart,
  globalBlendMode,
  bgPattern,
  logoTexture,
  textureIntensity,
  logoColor,
  enableColorOverride,
  snapToGrid,
  isHoveredPreview,
  key
}: { 
  template: MockupTemplate, 
  logoData: string, 
  logoScale: number,
  logoRotation: number,
  logoOpacity: number,
  logoPosition: { x: number, y: number },
  onPositionChange: (pos: { x: number, y: number }) => void,
  onScaleChange?: (scale: number) => void,
  onDragStart: () => void,
  globalBlendMode: 'normal' | 'multiply' | 'auto' | 'overlay' | 'difference' | 'screen',
  bgPattern: 'none' | 'checkerboard' | 'stripes',
  logoTexture: 'none' | 'grunge' | 'smooth' | 'embossed',
  textureIntensity: number,
  logoColor: string,
  enableColorOverride: boolean,
  snapToGrid: boolean,
  isHoveredPreview?: boolean,
  key?: React.Key
}) {
  const activeBlendMode = globalBlendMode === 'auto' 
    ? (template.defaultBlendMode || 'normal') 
    : globalBlendMode;
    
  const previewRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(logoPosition.x);
  const y = useMotionValue(logoPosition.y);

  useEffect(() => {
    x.set(logoPosition.x);
    y.set(logoPosition.y);
  }, [logoPosition, x, y]);

  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart();
  };

  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>, direction: string) => {
    e.stopPropagation(); // prevent framer-motion drag
    onDragStart();
    const startY = e.clientY;
    const initialScale = logoScale;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const delta = direction.includes('bottom') ? deltaY : -deltaY;
      const newScale = Math.max(0.1, Math.min(3, initialScale + (delta * 0.005)));
      if (onScaleChange) onScaleChange(newScale);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleDragEnd = (e: any, info: any) => {
    setIsDragging(false);
    const distance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    
    // Less sensitive: ignore tiny accidental movements
    if (distance < 5) {
      x.set(logoPosition.x);
      y.set(logoPosition.y);
      return;
    }

    let finalX = x.get();
    let finalY = y.get();

    if (snapToGrid) {
      finalX = Math.round(finalX / 15) * 15;
      finalY = Math.round(finalY / 15) * 15;
      x.set(finalX);
      y.set(finalY);
    }

    onPositionChange({ x: finalX, y: finalY });
  };

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
        <div 
          className={`absolute inset-0 transition-transform duration-500 ease-out origin-center ${isHoveredPreview ? 'scale-125' : 'scale-100'}`}
          style={isHoveredPreview ? { 
            transformOrigin: `${template.area.left + template.area.width / 2}% ${template.area.top + template.area.height / 2}%`
          } : undefined}
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
            ref={areaRef}
            className={`absolute flex items-center justify-center overflow-hidden transition-colors duration-200 ${
              isDragging ? 'ring-2 ring-blue-500/50 bg-blue-500/10' : ''
            }`}
            style={{
              top: `${template.area.top}%`,
              left: `${template.area.left}%`,
              width: `${template.area.width}%`,
              height: `${template.area.height}%`,
              mixBlendMode: activeBlendMode,
              opacity: logoOpacity
            }}
          >
            {isDragging && (
              <div className="absolute inset-0 border-2 border-dashed border-blue-500 pointer-events-none z-10" />
            )}
            {/* Action Image wrapper */}
            <motion.div 
              style={{ x, y }}
              drag
              dragConstraints={areaRef}
              dragElastic={0.1}
              dragMomentum={false}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              whileDrag={{ opacity: 0.6, scale: logoScale * 1.05 }}
              initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
              animate={{ scale: logoScale, opacity: 1, rotate: logoRotation }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing drop-shadow-sm group/logo"
            >
              <img 
                src={logoData} 
                alt="Logo overlaid"
                className="w-full h-full object-contain pointer-events-none"
                style={{ opacity: enableColorOverride ? 0 : 1 }}
                draggable={false}
              />
              {enableColorOverride && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: logoColor,
                    WebkitMaskImage: `url(${logoData})`,
                    WebkitMaskPosition: 'center',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskImage: `url(${logoData})`,
                    maskPosition: 'center',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                  }}
                />
              )}
              {logoTexture !== 'none' && TEXTURES[logoTexture] && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `url(${TEXTURES[logoTexture]}) center/cover`,
                    mixBlendMode: 'multiply',
                    opacity: textureIntensity,
                    WebkitMaskImage: `url(${logoData})`,
                    WebkitMaskPosition: 'center',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskImage: `url(${logoData})`,
                    maskPosition: 'center',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                  }}
                />
              )}
              
              {/* Resize Handles - visible on hover or drag */}
              <div 
                className="absolute inset-0 pointer-events-none border border-transparent group-hover/logo:border-blue-500/30 transition-colors"
                style={{ scale: 1 }}
              >
                <div 
                  onPointerDown={e => handleResizePointerDown(e, 'top-left')}
                  className="absolute top-0 left-0 w-3.5 h-3.5 bg-white border border-blue-500 rounded-full cursor-nwse-resize transform -translate-x-1/2 -translate-y-1/2 shadow-sm z-50 pointer-events-auto opacity-0 group-hover/logo:opacity-100 transition-opacity"
                  style={{ scale: 1 / logoScale }}
                />
                <div 
                  onPointerDown={e => handleResizePointerDown(e, 'top-right')}
                  className="absolute top-0 right-0 w-3.5 h-3.5 bg-white border border-blue-500 rounded-full cursor-nesw-resize transform translate-x-1/2 -translate-y-1/2 shadow-sm z-50 pointer-events-auto opacity-0 group-hover/logo:opacity-100 transition-opacity"
                  style={{ scale: 1 / logoScale }}
                />
                <div 
                  onPointerDown={e => handleResizePointerDown(e, 'bottom-left')}
                  className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-white border border-blue-500 rounded-full cursor-nesw-resize transform -translate-x-1/2 translate-y-1/2 shadow-sm z-50 pointer-events-auto opacity-0 group-hover/logo:opacity-100 transition-opacity"
                  style={{ scale: 1 / logoScale }}
                />
                <div 
                  onPointerDown={e => handleResizePointerDown(e, 'bottom-right')}
                  className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-white border border-blue-500 rounded-full cursor-nwse-resize transform translate-x-1/2 translate-y-1/2 shadow-sm z-50 pointer-events-auto opacity-0 group-hover/logo:opacity-100 transition-opacity"
                  style={{ scale: 1 / logoScale }}
                />
              </div>
            </motion.div>
          </div>
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
