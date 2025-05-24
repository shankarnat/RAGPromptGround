import { useState, useCallback, useRef } from 'react';

interface ProcessingConfig {
  rag: {
    enabled: boolean;
    chunking: boolean;
    vectorization: boolean;
    indexing: boolean;
    multimodal?: {
      transcription: boolean;
      ocr: boolean;
      imageCaption: boolean;
      visualAnalysis: boolean;
    };
  };
  kg: {
    enabled: boolean;
    entityExtraction: boolean;
    relationMapping: boolean;
    graphBuilding: boolean;
  };
  idp: {
    enabled: boolean;
    textExtraction: boolean;
    classification: boolean;
    metadata: boolean;
  };
}

export function useProcessingConfig(initialConfig: ProcessingConfig) {
  const [config, setConfig] = useState<ProcessingConfig>(initialConfig);
  const configRef = useRef(config);
  
  // Update ref whenever config changes
  configRef.current = config;

  // Granular update for specific processing type
  const updateProcessingType = useCallback((
    type: keyof ProcessingConfig,
    updates: Partial<ProcessingConfig[keyof ProcessingConfig]>
  ) => {
    console.log(`useProcessingConfig updateProcessingType called - type: ${type}, updates:`, updates);
    setConfig(prev => {
      console.log(`useProcessingConfig updateProcessingType - previous ${type} config:`, prev[type]);
      // Only update if there are actual changes
      const currentTypeConfig = prev[type];
      const hasChanges = Object.keys(updates).some(
        key => (currentTypeConfig as any)[key] !== (updates as any)[key]
      );

      console.log(`useProcessingConfig updateProcessingType - hasChanges: ${hasChanges}`);

      if (!hasChanges) {
        console.log('useProcessingConfig updateProcessingType - no changes, returning previous state');
        return prev;
      }

      const newConfig = {
        ...prev,
        [type]: {
          ...prev[type],
          ...updates
        }
      };
      
      console.log(`useProcessingConfig updateProcessingType - new ${type} config:`, newConfig[type]);
      return newConfig;
    });
  }, []);

  // Update specific option within a processing type
  const updateOption = useCallback((
    type: keyof ProcessingConfig,
    option: string,
    value: any
  ) => {
    console.log(`useProcessingConfig updateOption called - type: ${type}, option: ${option}, value:`, value);
    setConfig(prev => {
      const currentValue = (prev[type] as any)[option];
      console.log(`useProcessingConfig updateOption - current value: ${currentValue}, new value: ${value}`);
      
      // Skip update if value hasn't changed
      if (currentValue === value) {
        console.log('useProcessingConfig updateOption - value unchanged, skipping update');
        return prev;
      }

      const newConfig = {
        ...prev,
        [type]: {
          ...prev[type],
          [option]: value
        }
      };
      
      console.log(`useProcessingConfig updateOption - new config for ${type}:`, newConfig[type]);
      return newConfig;
    });
  }, []);

  // Update multimodal options for RAG
  const updateMultimodal = useCallback((
    option: keyof NonNullable<ProcessingConfig['rag']['multimodal']>,
    value: boolean
  ) => {
    console.log(`useProcessingConfig updateMultimodal called - option: ${option}, value: ${value}`);
    setConfig(prev => {
      // Initialize multimodal if it doesn't exist
      const currentMultimodal = prev.rag.multimodal || {
        transcription: false,
        ocr: false,
        imageCaption: false,
        visualAnalysis: false
      };

      const currentValue = currentMultimodal[option];
      console.log(`useProcessingConfig updateMultimodal - current value: ${currentValue}, new value: ${value}`);
      
      // Skip update if value hasn't changed
      if (currentValue === value) {
        console.log('useProcessingConfig updateMultimodal - value unchanged, skipping update');
        return prev;
      }

      const newConfig = {
        ...prev,
        rag: {
          ...prev.rag,
          multimodal: {
            ...currentMultimodal,
            [option]: value
          }
        }
      };
      
      console.log(`useProcessingConfig updateMultimodal - new multimodal config:`, newConfig.rag.multimodal);
      return newConfig;
    });
  }, []);

  // Batch update for multiple changes
  const batchUpdate = useCallback((updates: Partial<ProcessingConfig> | ((prev: ProcessingConfig) => Partial<ProcessingConfig>)) => {
    console.log('useProcessingConfig batchUpdate called with:', updates);
    setConfig(prev => {
      console.log('useProcessingConfig batchUpdate - previous config:', prev);
      console.log('useProcessingConfig batchUpdate - previous kg:', prev.kg);
      
      // Handle function updates
      const actualUpdates = typeof updates === 'function' ? updates(prev) : updates;
      
      // Deep merge the updates
      const newConfig = { ...prev };
      
      Object.entries(actualUpdates).forEach(([type, typeUpdates]) => {
        if (typeUpdates && typeof typeUpdates === 'object') {
          (newConfig as any)[type] = {
            ...(prev as any)[type],
            ...typeUpdates
          };
          console.log(`useProcessingConfig batchUpdate - merged ${type}:`, (newConfig as any)[type]);
        }
      });

      console.log('useProcessingConfig batchUpdate - new config:', newConfig);
      console.log('useProcessingConfig batchUpdate - new kg:', newConfig.kg);
      console.log('useProcessingConfig batchUpdate - kg.enabled changed from', prev.kg?.enabled, 'to', newConfig.kg?.enabled);
      return newConfig;
    });
  }, []);

  return {
    config,
    updateProcessingType,
    updateOption,
    updateMultimodal,
    batchUpdate,
    configRef
  };
}