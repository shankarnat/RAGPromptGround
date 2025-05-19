import { useState, useCallback, useRef, useEffect } from 'react';
import { StateManager } from '@/lib/stateUtils';

export interface MultimodalConfig {
  transcription: boolean;
  ocr: boolean;
  imageCaption: boolean;
  visualAnalysis: boolean;
}

interface UpdateSource {
  source: 'ai_assistant' | 'user' | 'system';
  timestamp: number;
}

export function useMultimodalConfig(initialConfig: MultimodalConfig) {
  const [config, setConfig] = useState<MultimodalConfig>(initialConfig);
  const [lastUpdate, setLastUpdate] = useState<UpdateSource | null>(null);
  const stateManagerRef = useRef<StateManager<MultimodalConfig>>();
  
  // Initialize state manager
  useEffect(() => {
    stateManagerRef.current = new StateManager(setConfig);
  }, []);

  const updateConfig = useCallback((
    updates: Partial<MultimodalConfig>,
    source: UpdateSource['source'] = 'user'
  ) => {
    console.log(`[useMultimodalConfig] Updating config from ${source}:`, updates);
    
    // Record the update source
    setLastUpdate({ source, timestamp: Date.now() });
    
    // Use state manager to queue the update
    stateManagerRef.current?.update(prev => {
      const newConfig = {
        ...prev,
        ...updates
      };
      console.log(`[useMultimodalConfig] Config after update:`, newConfig);
      return newConfig;
    });
  }, []);

  const toggleOption = useCallback((
    option: keyof MultimodalConfig,
    enabled: boolean,
    source: UpdateSource['source'] = 'user'
  ) => {
    updateConfig({ [option]: enabled }, source);
  }, [updateConfig]);

  // Prevent updates within a certain timeframe after AI updates
  const canUpdate = useCallback((source: UpdateSource['source']) => {
    if (!lastUpdate) return true;
    if (source === 'ai_assistant') return true; // AI can always update
    
    const timeSinceLastUpdate = Date.now() - lastUpdate.timestamp;
    const MIN_UPDATE_INTERVAL = 1000; // 1 second
    
    // If last update was from AI and less than 1 second ago, block user updates
    if (lastUpdate.source === 'ai_assistant' && timeSinceLastUpdate < MIN_UPDATE_INTERVAL) {
      console.log(`[useMultimodalConfig] Blocking ${source} update, too soon after AI update`);
      return false;
    }
    
    return true;
  }, [lastUpdate]);

  return {
    config,
    updateConfig,
    toggleOption,
    canUpdate,
    lastUpdate
  };
}