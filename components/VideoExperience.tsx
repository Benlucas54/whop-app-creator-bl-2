'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Play, 
  Plus, 
  Sun, 
  Moon,
  Settings,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { clientStorage } from '@/lib/client-storage';
import type { ExperienceData, VideoData } from '@/lib/whop-storage';

interface User {
  name?: string | null;
  username: string;
  id: string;
}

interface Experience {
  name: string;
  id: string;
}

interface VideoExperienceProps {
  user: User;
  experience: Experience;
  accessLevel: string;
  hasAccess: boolean;
}

// VideoItem type is now imported from whop-storage as VideoData
type VideoItem = VideoData;

export default function VideoExperience({ user, experience, accessLevel, hasAccess }: VideoExperienceProps) {
  const displayName = user.name || user.username;
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingVideoTitle, setEditingVideoTitle] = useState<string | null>(null);
  const [editingVideoUrl, setEditingVideoUrl] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [title, setTitle] = useState('Welcome to Your Video Experience');
  const [subtitle, setSubtitle] = useState('Share, react, and engage with videos like never before');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data from storage on component mount
  useEffect(() => {
    loadExperienceData();
  }, []);

  useEffect(() => {
    // Set the first video as current by default
    if (videos.length > 0 && !currentVideo) {
      setCurrentVideo(videos[0]);
    }
  }, [videos, currentVideo]);

  const loadExperienceData = async () => {
    try {
      setIsLoadingData(true);
      const data = await clientStorage.loadExperienceData(experience.id);
      
      if (data && clientStorage.validateExperienceData(data)) {
        setTitle(data.title);
        setSubtitle(data.subtitle);
        setVideos(data.videos);
        console.log('Loaded experience data from storage:', data);
      } else {
        // Use default data if no stored data found
        const defaultData = clientStorage.createDefaultData();
        setTitle(defaultData.title);
        setSubtitle(defaultData.subtitle);
        setVideos(defaultData.videos);
        console.log('Using default experience data');
      }
    } catch (error) {
      console.error('Error loading experience data:', error);
      // Fallback to default data
      const defaultData = clientStorage.createDefaultData();
      setTitle(defaultData.title);
      setSubtitle(defaultData.subtitle);
      setVideos(defaultData.videos);
    } finally {
      setIsLoadingData(false);
    }
  };

  const saveExperienceData = async (data: { title: string; subtitle: string; videos: VideoItem[] }) => {
    try {
      setIsSaving(true);
      const result = await clientStorage.saveExperienceData(experience.id, data);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save data');
      }
      
      console.log('Successfully saved experience data:', result.data);
    } catch (error) {
      console.error('Error saving experience data:', error);
      // You could add user notification here
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save function
  const debouncedSave = (data: { title: string; subtitle: string; videos: VideoItem[] }) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveExperienceData(data);
    }, 1000); // Save after 1 second of inactivity
  };

  const getVideoEmbedUrl = (url: string): string | null => {
    // YouTube video handling
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Loom video handling
    if (url.includes('loom.com/share/')) {
      const videoId = url.split('loom.com/share/')[1];
      if (videoId) {
        return `https://www.loom.com/embed/${videoId}`;
      }
    }
    
    return null;
  };

  const getOriginalUrlFromEmbed = (embedUrl: string): string => {
    // Convert YouTube embed URL back to original
    if (embedUrl.includes('youtube.com/embed/')) {
      const videoId = embedUrl.split('youtube.com/embed/')[1];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // Convert Loom embed URL back to original
    if (embedUrl.includes('loom.com/embed/')) {
      const videoId = embedUrl.split('loom.com/embed/')[1];
      return `https://www.loom.com/share/${videoId}`;
    }
    
    return embedUrl; // Return as-is if not a recognized embed URL
  };

  const handleLoadVideo = async () => {
    if (!videoUrl.trim()) return;
    
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const embedUrl = getVideoEmbedUrl(videoUrl);
    
    if (embedUrl) {
      const newVideo: VideoItem = {
        id: Date.now().toString(),
        title: 'New Video',
        url: embedUrl,
        duration: '0:00',
        createdAt: new Date().toISOString()
      };
      
      const updatedVideos = [...videos, newVideo];
      setVideos(updatedVideos);
      setCurrentVideo(newVideo);
      setVideoUrl('');
      
      // Save the updated data
      debouncedSave({
        title,
        subtitle,
        videos: updatedVideos,
      });
    } else {
      alert('Please enter a valid YouTube or Loom video URL');
    }
    
    setIsLoading(false);
  };

  const handleVideoSelect = (video: VideoItem) => {
    setCurrentVideo(video);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleTitleEdit = () => {
    setEditingTitle(true);
  };

  const handleSubtitleEdit = () => {
    setEditingSubtitle(true);
  };

  const handleTitleSave = () => {
    setEditingTitle(false);
    // Save the updated data
    debouncedSave({
      title,
      subtitle,
      videos,
    });
  };

  const handleSubtitleSave = () => {
    setEditingSubtitle(false);
    // Save the updated data
    debouncedSave({
      title,
      subtitle,
      videos,
    });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    }
  };

  const handleSubtitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubtitleSave();
    }
  };

  const handleVideoTitleEdit = (videoId: string) => {
    console.log('handleVideoTitleEdit called with videoId:', videoId, 'isAdminMode:', isAdminMode);
    setEditingVideoTitle(videoId);
  };

  const handleVideoTitleSave = (videoId: string, newTitle: string) => {
    const updatedVideos = videos.map(video => 
      video.id === videoId ? { ...video, title: newTitle } : video
    );
    setVideos(updatedVideos);
    
    // Update the current video title if it's the one being edited
    if (currentVideo?.id === videoId) {
      setCurrentVideo(prev => prev ? { ...prev, title: newTitle } : null);
    }
    
    setEditingVideoTitle(null);
    
    // Save the updated data
    debouncedSave({
      title,
      subtitle,
      videos: updatedVideos,
    });
  };

  const handleVideoTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, videoId: string) => {
    if (e.key === 'Enter') {
      handleVideoTitleSave(videoId, e.currentTarget.value);
    } else if (e.key === 'Escape') {
      setEditingVideoTitle(null);
    }
  };

  const handleVideoUrlEdit = (videoId: string) => {
    setEditingVideoUrl(videoId);
  };

  const handleVideoUrlSave = (videoId: string, newUrl: string) => {
    const embedUrl = getVideoEmbedUrl(newUrl);
    if (embedUrl) {
      const updatedVideos = videos.map(video => 
        video.id === videoId ? { ...video, url: embedUrl } : video
      );
      setVideos(updatedVideos);
      
      // Update the current video URL if it's the one being edited
      if (currentVideo?.id === videoId) {
        setCurrentVideo(prev => prev ? { ...prev, url: embedUrl } : null);
      }
      
      // Save the updated data
      debouncedSave({
        title,
        subtitle,
        videos: updatedVideos,
      });
    } else {
      alert('Please enter a valid YouTube or Loom video URL');
    }
    
    setEditingVideoUrl(null);
  };

  const handleVideoUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, videoId: string) => {
    if (e.key === 'Enter') {
      handleVideoUrlSave(videoId, e.currentTarget.value);
    } else if (e.key === 'Escape') {
      setEditingVideoUrl(null);
    }
  };

  if (isLoadingData) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100'
      }`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Loading your video experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100'
    }`}>
      {/* Mobile Sidebar Overlay - Removed to allow interaction with main content */}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out
        ${isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'}
        backdrop-blur-xl border-r
        ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${sidebarCollapsed ? 'w-16 lg:w-16' : 'w-80 lg:w-80'}
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/30">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Video Library
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              )}
            </button>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Add Video Button - Admin Only */}
        {accessLevel === 'admin' && isAdminMode && (
          <div className="p-4">
            <button
              onClick={() => {/* Add new video logic */}}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                ${isDarkMode 
                  ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-purple-500/30' 
                  : 'bg-slate-100/50 hover:bg-slate-200/50 border border-slate-200/50 hover:border-purple-400/30'
                }
                group
              `}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4 text-white" />
              </div>
              {!sidebarCollapsed && (
                <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Add Video
                </span>
              )}
            </button>
          </div>
        )}

        {/* Video List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {videos.map((video) => (
              <div
                key={video.id}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left
                  ${currentVideo?.id === video.id
                    ? `${isDarkMode ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-100/50 border border-purple-300/50'}`
                    : `${isDarkMode ? 'bg-slate-800/30 hover:bg-slate-700/40 border border-transparent' : 'bg-slate-100/30 hover:bg-slate-200/40 border border-transparent'}`
                  }
                  group
                `}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleVideoSelect(video)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </div>
                    
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        {editingVideoTitle === video.id && isAdminMode ? (
                          <input
                            type="text"
                            defaultValue={video.title}
                            onBlur={(e) => handleVideoTitleSave(video.id, e.target.value)}
                            onKeyDown={(e) => handleVideoTitleKeyDown(e, video.id)}
                            className={`
                              w-full bg-transparent border-none outline-none font-medium text-sm
                              ${currentVideo?.id === video.id 
                                ? (isDarkMode ? 'text-white' : 'text-gray-900')
                                : (isDarkMode ? 'text-slate-200' : 'text-slate-700')
                              }
                            `}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <h3 
                            className={`font-medium truncate ${
                              currentVideo?.id === video.id 
                                ? (isDarkMode ? 'text-white' : 'text-gray-900')
                                : (isDarkMode ? 'text-slate-200' : 'text-slate-700')
                            }`}
                          >
                            {video.title}
                          </h3>
                        )}
                      </div>
                    )}
                  </button>
                  
                </div>

                {/* Delete Button - Admin Only */}
                {accessLevel === 'admin' && isAdminMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const updatedVideos = videos.filter(v => v.id !== video.id);
                      setVideos(updatedVideos);
                      if (currentVideo?.id === video.id) {
                        setCurrentVideo(null);
                      }
                      
                      // Save the updated data
                      debouncedSave({
                        title,
                        subtitle,
                        videos: updatedVideos,
                      });
                    }}
                    className={`
                      p-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100
                      ${isDarkMode 
                        ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                        : 'hover:bg-red-100 text-red-500 hover:text-red-600'
                      }
                    `}
                    title="Delete video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Admin Settings Button */}
        {accessLevel === 'admin' && (
          <div className="p-4 border-t border-slate-700/30">
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                ${isAdminMode 
                  ? `${isDarkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-100/50 border border-red-300/50'}`
                  : `${isDarkMode 
                    ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-red-500/30' 
                    : 'bg-slate-100/50 hover:bg-slate-200/50 border border-slate-200/50 hover:border-red-400/30'
                  }`
                }
                group
              `}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
                isAdminMode 
                  ? 'bg-red-500' 
                  : 'bg-gradient-to-br from-red-500 to-orange-500'
              }`}>
                <Settings className="w-4 h-4 text-white" />
              </div>
              {!sidebarCollapsed && (
                <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  {isAdminMode ? 'Save & Exit' : 'Admin Settings'}
                </span>
              )}
            </button>
          </div>
        )}

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {displayName}
                </p>
                <p className={`text-sm truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {accessLevel}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'}
        ml-0
        ${sidebarOpen ? 'lg:shadow-none shadow-lg border-l border-slate-200/20' : ''}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`
              p-3 rounded-xl transition-all duration-200
              ${isDarkMode 
                ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50' 
                : 'bg-white/50 hover:bg-gray-100/50 border border-slate-200/50'
              }
              group
            `}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="px-6 pb-8">
          {/* Editable Header */}
          <div className="text-center mb-12">
            {editingTitle && isAdminMode ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className={`
                  text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight
                  bg-transparent border-none outline-none text-center w-full
                  ${isDarkMode ? 'text-white' : 'text-gray-900'}
                `}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
                autoFocus
              />
                   ) : (
                     <div className="relative">
                       <h1
                         onClick={isAdminMode ? handleTitleEdit : undefined}
                         className={`text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight transition-opacity ${
                           isAdminMode ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                         }`}
                         style={{
                           background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           backgroundClip: 'text'
                         }}
                       >
                         {title}
                       </h1>
                     </div>
                   )}

            {editingSubtitle && isAdminMode ? (
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                onBlur={handleSubtitleSave}
                onKeyDown={handleSubtitleKeyDown}
                className={`
                  text-xl md:text-2xl font-light bg-transparent border-none outline-none text-center w-full
                  ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}
                `}
                autoFocus
              />
                   ) : (
                     <div className="relative inline-block">
                       <p
                         onClick={isAdminMode ? handleSubtitleEdit : undefined}
                         className={`text-xl md:text-2xl font-light transition-opacity ${
                           isAdminMode ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                         } ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
                       >
                         {subtitle}
                       </p>
                     </div>
                   )}

                   {/* Admin Mode Indicator */}
                   {isAdminMode && (
                     <div className="mt-4 flex flex-col items-center justify-center gap-2">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                         <span className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                           Admin Edit Mode
                         </span>
                       </div>
                     </div>
                   )}
            
            {/* Save Indicator */}
            {isSaving && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Saving changes...
                </span>
              </div>
            )}
          </div>

          {/* Video Player Area */}
          <div className="max-w-6xl mx-auto">
            {currentVideo ? (
              <div className={`
                rounded-2xl p-8 transition-all duration-300
                ${isDarkMode 
                  ? 'bg-slate-900/50 backdrop-blur-xl border border-slate-700/50' 
                  : 'bg-white/50 backdrop-blur-xl border border-slate-200/50'
                }
                shadow-2xl
              `}>
                       <div className="flex items-center justify-between mb-6">
                         <div className="flex-1">
                           {editingVideoTitle === currentVideo.id && isAdminMode ? (
                             <input
                               type="text"
                               defaultValue={currentVideo.title}
                               onBlur={(e) => handleVideoTitleSave(currentVideo.id, e.target.value)}
                               onKeyDown={(e) => handleVideoTitleKeyDown(e, currentVideo.id)}
                               className={`
                                 text-2xl font-semibold bg-transparent border-none outline-none
                                 ${isDarkMode ? 'text-white' : 'text-gray-900'}
                               `}
                               autoFocus
                             />
                           ) : (
                             <div className="flex items-center gap-3">
                               <h2 
                                 onClick={isAdminMode ? () => handleVideoTitleEdit(currentVideo.id) : undefined}
                                 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isAdminMode ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                               >
                                 {currentVideo.title}
                               </h2>
                             </div>
                           )}
                         </div>
                       </div>

                {/* Admin Video URL Edit */}
                {isAdminMode && (
                  <div className="mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Video URL (Admin Edit)
                    </h3>
                    {editingVideoUrl === currentVideo.id ? (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          defaultValue={getOriginalUrlFromEmbed(currentVideo.url)}
                          onBlur={(e) => handleVideoUrlSave(currentVideo.id, e.target.value)}
                          onKeyDown={(e) => handleVideoUrlKeyDown(e, currentVideo.id)}
                          placeholder="Enter YouTube or Loom URL..."
                          className={`
                            flex-1 px-3 py-2 rounded-lg text-sm bg-transparent border border-slate-600/50
                            ${isDarkMode ? 'text-white placeholder-slate-400' : 'text-gray-900 placeholder-slate-500'}
                            focus:outline-none focus:border-purple-500/50
                          `}
                          autoFocus
                        />
                        <button
                          onClick={() => setEditingVideoUrl(null)}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            isDarkMode 
                              ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300' 
                              : 'bg-slate-200/50 hover:bg-slate-300/50 text-slate-600'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm truncate flex-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {getOriginalUrlFromEmbed(currentVideo.url)}
                        </span>
                        <button
                          onClick={() => handleVideoUrlEdit(currentVideo.id)}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30' 
                              : 'bg-purple-100 hover:bg-purple-200 text-purple-600 border border-purple-300'
                          }`}
                        >
                          Edit URL
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Video Player */}
                <div className="relative w-full mb-6" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={currentVideo.url}
                    className="absolute top-0 left-0 w-full h-full rounded-xl"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={currentVideo.title}
                  />
                </div>

              </div>
            ) : (
              /* Add Video Interface - Admin Only */
              accessLevel === 'admin' && isAdminMode ? (
                <div className={`
                  rounded-2xl p-8 transition-all duration-300
                  ${isDarkMode 
                    ? 'bg-slate-900/50 backdrop-blur-xl border border-slate-700/50' 
                    : 'bg-white/50 backdrop-blur-xl border border-slate-200/50'
                  }
                  shadow-2xl
                `}>
                  <h2 className={`text-3xl font-semibold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Add New Video
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Paste your Loom or YouTube URL here..."
                        className={`
                          flex-1 px-6 py-4 rounded-xl text-lg font-normal focus:outline-none transition-all duration-200
                          ${isDarkMode 
                            ? 'bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-500/50' 
                            : 'bg-white/50 border border-slate-300/50 text-gray-900 placeholder-slate-500 focus:border-purple-400/50'
                          }
                        `}
                      />
                      <button
                        onClick={handleLoadVideo}
                        disabled={!videoUrl.trim() || isLoading}
                        className="
                          px-8 py-4 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed
                          bg-gradient-to-r from-purple-500 to-blue-500 text-white
                          hover:from-purple-600 hover:to-blue-600 hover:scale-105
                          transition-all duration-200 shadow-lg hover:shadow-xl
                        "
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Loading...
                          </div>
                        ) : (
                          'Load Video'
                        )}
                      </button>
                    </div>
                    
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Supports YouTube and Loom video links
                    </p>
                  </div>
                </div>
              ) : (
                /* Default Message for Non-Admins */
                <div className={`
                  rounded-2xl p-8 transition-all duration-300 text-center
                  ${isDarkMode 
                    ? 'bg-slate-900/50 backdrop-blur-xl border border-slate-700/50' 
                    : 'bg-white/50 backdrop-blur-xl border border-slate-200/50'
                  }
                  shadow-2xl
                `}>
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    No Video Selected
                  </h2>
                  <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Select a video from the sidebar to start watching
                  </p>
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            {isAdminMode ? (
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Click on the heading or subheading to edit them
              </p>
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Experience: Loom Embed • Powered by Whop
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}