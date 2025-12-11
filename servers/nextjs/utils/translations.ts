export type TranslationKey = 
  // Header Navigation
  | 'nav.dashboard'
  | 'nav.settings'
  | 'nav.createTemplate'
  | 'nav.templates'
  
  // Dashboard Page
  | 'dashboard.title'
  | 'dashboard.noPresentations'
  | 'dashboard.noPresentationsDesc'
  | 'dashboard.getStarted'
  | 'dashboard.recentPresentations'
  | 'dashboard.allPresentations'
  | 'dashboard.createdAt'
  | 'dashboard.lastModified'
  | 'dashboard.slides'
  | 'dashboard.open'
  | 'dashboard.delete'
  | 'dashboard.deleteConfirm'
  | 'dashboard.deleteSuccess'
  | 'dashboard.deleteFailed'
  | 'dashboard.createNewPresentation'
  | 'dashboard.createVideoPresentation'
  | 'dashboard.startFromScratch'
  | 'dashboard.tryAgain'
  
  // Template Preview Page
  | 'templates.allTemplates'
  | 'templates.customAITemplates'
  | 'templates.createCustomTemplate'
  | 'templates.createFirstTemplate'
  | 'templates.inbuiltTemplates'
  | 'templates.general'
  | 'templates.modern'
  | 'templates.standard'
  | 'templates.generalDesc'
  | 'templates.modernDesc'
  | 'templates.standardDesc'
  | 'templates.layouts'
  
  // Custom Template Page
  | 'customTemplate.title'
  | 'customTemplate.addGoogleApiKey'
  | 'customTemplate.addOpenAiApiKey'
  | 'customTemplate.requiresGPT5'
  | 'customTemplate.uploadSlide'
  | 'customTemplate.dragDropPPTX'
  | 'customTemplate.orClickToSelect'
  | 'customTemplate.onlyPPTX'
  | 'customTemplate.uploadSuccess'
  | 'customTemplate.slides'
  | 'customTemplate.saveLayout'
  | 'customTemplate.saving'
  | 'customTemplate.saved'
  | 'customTemplate.enterLayoutName'
  | 'customTemplate.layoutNamePlaceholder'
  | 'customTemplate.saveButton'
  | 'customTemplate.uploadPPTX'
  | 'customTemplate.clickToUpload'
  | 'customTemplate.maxFileSize'
  | 'customTemplate.processFile'
  | 'customTemplate.extractingSlides'
  | 'customTemplate.selectFile'
  | 'customTemplate.slidesCompleted'
  | 'customTemplate.saveTemplate'
  | 'customTemplate.savingTemplate'
  | 'customTemplate.templateName'
  | 'customTemplate.description'
  | 'customTemplate.enterTemplateName'
  | 'customTemplate.enterDescription'
  | 'customTemplate.descriptionForTemplate'
  
  // Outline Page
  | 'outline.title'
  | 'outline.generatePresentation'
  | 'outline.generating'
  | 'outline.editOutline'
  | 'outline.addSlide'
  | 'outline.deleteSlide'
  | 'outline.slideContent'
  | 'outline.selectTemplate'
  | 'outline.noOutline'
  | 'outline.startCreating'
  | 'outline.generatingPresentationData'
  | 'outline.inBuiltTemplates'
  | 'outline.customAITemplates'
  | 'outline.noCustomTemplates'
  | 'outline.noTemplatesAvailable'
  | 'outline.noTemplatesAvailableDesc'
  | 'outline.layouts'
  | 'outline.structured'
  | 'outline.flexible'
  
  // Application Initialization
  | 'app.initializing'
  | 'app.loadingConfig'
  
  // Home Page
  | 'home.saveConfiguration'
  | 'home.savingConfiguration'
  | 'home.downloadingModelProgress'
  | 'home.percentComplete'
  | 'home.openSourceAIPresentationGenerator'
  
  // Presentation Page
  | 'presentation.title'
  | 'presentation.present'
  | 'presentation.export'
  | 'presentation.exportPDF'
  | 'presentation.exportPPTX'
  | 'presentation.exporting'
  | 'presentation.reGenerate'
  | 'presentation.undo'
  | 'presentation.redo'
  | 'presentation.share'
  | 'presentation.addSlide'
  | 'presentation.deleteSlide'
  | 'presentation.duplicateSlide'
  | 'presentation.moveUp'
  | 'presentation.moveDown'
  | 'presentation.editContent'
  | 'presentation.changeLayout'
  | 'presentation.saving'
  | 'presentation.saved'
  | 'presentation.autoSave'
  | 'presentation.exportError'
  | 'presentation.exportErrorDesc'
  | 'presentation.failedToGetPptxModel'
  | 'presentation.failedToConvertPptxModel'
  | 'presentation.serverError'
  | 'presentation.invalidPptxModel'
  
  // Settings Page
  | 'settings.title'
  | 'settings.saveConfiguration'
  | 'settings.savingConfiguration'
  | 'settings.configurationSaved'
  | 'settings.failedToSave'
  | 'settings.downloadingModel'
  | 'settings.downloadComplete'
  | 'settings.modelDownloaded'
  | 'settings.complete'
  | 'settings.downloading'
  | 'settings.verifying'
  | 'settings.pulling'
  | 'settings.downloadingModelFiles'
  | 'settings.verifyingModelIntegrity'
  | 'settings.pullingModelFromRegistry'
  | 'settings.downloaded'
  | 'settings.total'
  
  // Upload/Create Page
  | 'upload.createPresentation'
  | 'upload.supportingDocuments'
  | 'upload.tellUsAboutPresentation'
  | 'upload.provideSpecificDetails'
  | 'upload.dragAndDrop'
  | 'upload.dropFileHere'
  | 'upload.supportedFormats'
  | 'upload.chooseFiles'
  | 'upload.selectedFiles'
  | 'upload.next'
  | 'upload.filesSelected'
  | 'upload.filesAdded'
  | 'upload.invalidFileType'
  | 'upload.invalidFileTypeDesc'
  | 'upload.multiplePdfNotAllowed'
  | 'upload.multiplePdfNotAllowedDesc'
  | 'upload.selectSlidesAndLanguage'
  | 'upload.noPromptOrDocument'
  | 'upload.advancedSettings'
  | 'upload.customInstructions'
  | 'upload.customInstructionsPlaceholder'
  
  // Language Selector
  | 'language.english'
  | 'language.chinese'
  | 'language.selectLanguage'
  
  // Common
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.close'
  | 'common.back'
  | 'common.copiedToClipboard'
  | 'common.noTemplateFound'
  | 'common.advancedSettings'
  
  // Advanced Settings Dialog
  | 'advanced.tone'
  | 'advanced.toneDesc'
  | 'advanced.selectTone'
  | 'advanced.verbosity'
  | 'advanced.verbosityDesc'
  | 'advanced.selectVerbosity'
  | 'advanced.includeTableOfContents'
  | 'advanced.includeTableOfContentsDesc'
  | 'advanced.titleSlide'
  | 'advanced.titleSlideDesc'
  | 'advanced.webSearch'
  | 'advanced.webSearchDesc'
  | 'advanced.instructions'
  | 'advanced.instructionsDesc'
  | 'advanced.instructionsPlaceholder'
  
  // Tone options
  | 'tone.default'
  | 'tone.casual'
  | 'tone.professional'
  | 'tone.funny'
  | 'tone.educational'
  | 'tone.salesPitch'
  
  // Verbosity options
  | 'verbosity.concise'
  | 'verbosity.standard'
  | 'verbosity.textHeavy'
  
  // Slide count
  | 'slides.slides'
  | 'slides.selectSlides'
  
  // Language selector
  | 'language.selectLanguage2'
  | 'language.searchLanguage'
  | 'language.noLanguageFound'
  
  // Settings Page - Common
  | 'settings.apiKeyStoredLocally'
  | 'settings.checkForAvailableModels'
  | 'settings.checkingForModels'
  | 'settings.noModelsFound'
  | 'settings.noModelsFoundDesc'
  | 'settings.selectModel'
  | 'settings.selectAModel'
  | 'settings.searchModel'
  | 'settings.noModelFound'
  | 'settings.selectImageProvider'
  | 'settings.pexelsApiKey'
  | 'settings.apiKeyForPexels'
  | 'settings.pleaseSelectModel'
  | 'settings.pleaseEnterApiKey'
  | 'settings.pleaseEnterOllamaUrl'
  | 'settings.selectedModels'
  | 'settings.usingForTextGeneration'
  | 'settings.forImages'
  | 'settings.and'
  
  // Settings Page - Custom LLM
  | 'settings.openaiCompatibleUrl'
  | 'settings.enterYourUrl'
  | 'settings.openaiCompatibleApiKey'
  | 'settings.enterYourApiKey'
  | 'settings.importantToolCalls'
  | 'settings.useToolCalls'
  | 'settings.useToolCallsDesc'
  | 'settings.disableThinking'
  | 'settings.disableThinkingDesc'
  
  // Settings Page - Google
  | 'settings.googleApiKey'
  | 'settings.enableWebGrounding'
  | 'settings.enableWebGroundingDesc'
  
  // Settings Page - OpenAI
  | 'settings.openaiApiKey'
  | 'settings.enterYourOpenaiApiKey'
  
  // Settings Page - Anthropic
  | 'settings.anthropicApiKey'
  | 'settings.enterYourAnthropicApiKey'
  
  // Settings Page - Ollama
  | 'settings.useCustomOllamaUrl'
  | 'settings.chooseASupportedModel'
  | 'settings.ollamaUrl'
  | 'settings.enterOllamaUrl'
  | 'settings.customOllamaDesc';

// Helper function to get tone translation key
export const getToneTranslationKey = (tone: string): TranslationKey => {
  const toneMap: Record<string, TranslationKey> = {
    'default': 'tone.default',
    'casual': 'tone.casual',
    'professional': 'tone.professional',
    'funny': 'tone.funny',
    'educational': 'tone.educational',
    'sales_pitch': 'tone.salesPitch',
  };
  return toneMap[tone] || 'tone.default';
};

// Helper function to get verbosity translation key
export const getVerbosityTranslationKey = (verbosity: string): TranslationKey => {
  const verbosityMap: Record<string, TranslationKey> = {
    'concise': 'verbosity.concise',
    'standard': 'verbosity.standard',
    'text-heavy': 'verbosity.textHeavy',
  };
  return verbosityMap[verbosity] || 'verbosity.standard';
};

export const translations: Record<'en' | 'zh', Record<TranslationKey, string>> = {
  en: {
    // Header Navigation
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.createTemplate': 'Create Template',
    'nav.templates': 'Templates',
    
    // Dashboard Page
    'dashboard.title': 'Dashboard',
    'dashboard.noPresentations': 'No presentations yet',
    'dashboard.noPresentationsDesc': 'Create your first presentation to get started',
    'dashboard.getStarted': 'Get Started',
    'dashboard.recentPresentations': 'Recent Presentations',
    'dashboard.allPresentations': 'All Presentations',
    'dashboard.createdAt': 'Created',
    'dashboard.lastModified': 'Last Modified',
    'dashboard.slides': 'slides',
    'dashboard.open': 'Open',
    'dashboard.delete': 'Delete',
    'dashboard.deleteConfirm': 'Are you sure you want to delete this presentation?',
    'dashboard.deleteSuccess': 'Presentation deleted successfully',
    'dashboard.deleteFailed': 'Failed to delete presentation',
    'dashboard.createNewPresentation': 'Create New Presentation',
    'dashboard.createVideoPresentation': 'Create Video Presentation',
    'dashboard.startFromScratch': 'Start from scratch and bring your ideas to life',
    'dashboard.tryAgain': 'Try again',
    
    // Template Preview Page
    'templates.allTemplates': 'All Templates',
    'templates.customAITemplates': 'Custom AI Templates',
    'templates.createCustomTemplate': 'Create Custom Template',
    'templates.createFirstTemplate': 'Create your first custom template',
    'templates.inbuiltTemplates': 'Inbuilt Templates',
    'templates.general': 'General',
    'templates.modern': 'Modern',
    'templates.standard': 'Standard',
    'templates.generalDesc': 'General purpose layouts for common presentation elements',
    'templates.modernDesc': 'Modern white and blue business pitch deck layouts with clean, professional design',
    'templates.standardDesc': 'Standard layouts for presentations',
    'templates.layouts': 'layouts',
    
    // Custom Template Page
    'customTemplate.title': 'Create Custom Template',
    'customTemplate.addGoogleApiKey': 'Please add "GOOGLE_API_KEY" to enable template creation via AI.',
    'customTemplate.addOpenAiApiKey': 'Please add your OpenAI API Key to process the layout',
    'customTemplate.requiresGPT5': 'This feature requires an OpenAI model GPT-5. Configure your key in settings or via environment variables.',
    'customTemplate.uploadSlide': 'Upload Slide',
    'customTemplate.dragDropPPTX': 'Drag and drop your PPTX file here',
    'customTemplate.orClickToSelect': 'or click to select file',
    'customTemplate.onlyPPTX': 'Only .pptx files are supported',
    'customTemplate.uploadSuccess': 'File uploaded successfully',
    'customTemplate.slides': 'Slides',
    'customTemplate.saveLayout': 'Save Layout',
    'customTemplate.saving': 'Saving',
    'customTemplate.saved': 'Saved',
    'customTemplate.enterLayoutName': 'Enter layout name',
    'customTemplate.layoutNamePlaceholder': 'My Custom Layout',
    'customTemplate.saveButton': 'Save',
    'customTemplate.uploadPPTX': 'Upload PDF or PPTX File',
    'customTemplate.clickToUpload': 'Click to upload a PDF or PPTX file',
    'customTemplate.maxFileSize': 'Select a PDF or PowerPoint file (.pdf or .pptx) to process. Maximum file size: 100MB',
    'customTemplate.processFile': 'Process File',
    'customTemplate.extractingSlides': 'Extracting Slides...',
    'customTemplate.selectFile': 'Select a PDF or PPTX file',
    'customTemplate.slidesCompleted': 'slides completed',
    'customTemplate.saveTemplate': 'Save Template',
    'customTemplate.savingTemplate': 'Saving Template...',
    'customTemplate.templateName': 'Template Name',
    'customTemplate.description': 'Description',
    'customTemplate.enterTemplateName': 'Enter template name...',
    'customTemplate.enterDescription': 'Enter a description for your template...',
    'customTemplate.descriptionForTemplate': 'Enter a name and description for your template. This will help you identify it later.',
    
    // Outline Page
    'outline.title': 'Outline',
    'outline.generatePresentation': 'Generate Presentation',
    'outline.generating': 'Generating',
    'outline.editOutline': 'Edit Outline',
    'outline.addSlide': 'Add Slide',
    'outline.deleteSlide': 'Delete Slide',
    'outline.slideContent': 'Slide Content',
    'outline.selectTemplate': 'Select Template',
    'outline.noOutline': 'No outline yet',
    'outline.startCreating': 'Start creating your presentation',
    'outline.generatingPresentationData': 'Generating presentation data...',
    'outline.inBuiltTemplates': 'In Built Templates',
    'outline.customAITemplates': 'Custom AI Templates',
    'outline.noCustomTemplates': 'No custom templates. Create one from "All Templates" menu.',
    'outline.noTemplatesAvailable': 'No Templates Available',
    'outline.noTemplatesAvailableDesc': 'No presentation templates could be loaded. Please try refreshing the page.',
    'outline.layouts': 'layouts',
    'outline.structured': 'Structured',
    'outline.flexible': 'Flexible',
    
    // Application Initialization
    'app.initializing': 'Initializing Application',
    'app.loadingConfig': 'Loading configuration and checking model availability...',
    
    // Home Page
    'home.saveConfiguration': 'Save Configuration',
    'home.savingConfiguration': 'Saving Configuration...',
    'home.downloadingModelProgress': 'Downloading Model ({percentage}%)',
    'home.percentComplete': '{percentage}% Complete',
    'home.openSourceAIPresentationGenerator': 'Open-source AI presentation generator',
    
    // Presentation Page
    'presentation.title': 'Presentation',
    'presentation.present': 'Present',
    'presentation.export': 'Export',
    'presentation.exportPDF': 'Export as PDF',
    'presentation.exportPPTX': 'Export as PPTX',
    'presentation.exporting': 'Exporting presentation...',
    'presentation.reGenerate': 'Re-Generate',
    'presentation.undo': 'Undo',
    'presentation.redo': 'Redo',
    'presentation.share': 'Share',
    'presentation.addSlide': 'Add Slide',
    'presentation.deleteSlide': 'Delete Slide',
    'presentation.duplicateSlide': 'Duplicate Slide',
    'presentation.moveUp': 'Move Up',
    'presentation.moveDown': 'Move Down',
    'presentation.editContent': 'Edit Content',
    'presentation.changeLayout': 'Change Layout',
    'presentation.saving': 'Saving...',
    'presentation.saved': 'Saved',
    'presentation.autoSave': 'Auto Save',
    'presentation.exportError': 'Having trouble exporting!',
    'presentation.exportErrorDesc': 'We are having trouble exporting your presentation. Please try again.',
    'presentation.failedToGetPptxModel': 'Failed to get presentation PPTX model',
    'presentation.failedToConvertPptxModel': 'Failed to convert presentation to PPTX model. Please check if the presentation is valid.',
    'presentation.serverError': 'Server error',
    'presentation.invalidPptxModel': 'Invalid PPTX model received from server',
    
    // Settings Page
    'settings.title': 'Settings',
    'settings.saveConfiguration': 'Save Configuration',
    'settings.savingConfiguration': 'Saving Configuration...',
    'settings.configurationSaved': 'Configuration saved successfully',
    'settings.failedToSave': 'Failed to save configuration',
    'settings.downloadingModel': 'Downloading Model',
    'settings.downloadComplete': 'Download Complete!',
    'settings.modelDownloaded': 'Model downloaded successfully!',
    'settings.complete': 'Complete',
    'settings.downloading': 'downloading',
    'settings.verifying': 'verifying',
    'settings.pulling': 'pulling',
    'settings.downloadingModelFiles': 'Downloading model files...',
    'settings.verifyingModelIntegrity': 'Verifying model integrity...',
    'settings.pullingModelFromRegistry': 'Pulling model from registry...',
    'settings.downloaded': 'Downloaded',
    'settings.total': 'Total',
    
    // Upload/Create Page
    'upload.createPresentation': 'Create Presentation',
    'upload.supportingDocuments': 'Supporting Documents',
    'upload.tellUsAboutPresentation': 'Tell us about your presentation',
    'upload.provideSpecificDetails': 'Provide specific details about your presentation needs (e.g., topic, style, key points) for more accurate results',
    'upload.dragAndDrop': 'Drag and drop your file here or click below button',
    'upload.dropFileHere': 'Drop your file here',
    'upload.supportedFormats': 'Supports PDFs, Text files, PPTX, DOCX',
    'upload.chooseFiles': 'Choose Files',
    'upload.selectedFiles': 'Selected Files',
    'upload.next': 'Next',
    'upload.filesSelected': 'Files selected',
    'upload.filesAdded': 'file(s) have been added',
    'upload.invalidFileType': 'Invalid file type',
    'upload.invalidFileTypeDesc': 'Please upload only PDF, TXT, PPTX, or DOCX files',
    'upload.multiplePdfNotAllowed': 'Multiple PDF files are not allowed',
    'upload.multiplePdfNotAllowedDesc': 'Please select only one PDF file',
    'upload.selectSlidesAndLanguage': 'Please select number of Slides & Language',
    'upload.noPromptOrDocument': 'No Prompt or Document Provided',
    'upload.advancedSettings': 'Advanced Settings',
    'upload.customInstructions': 'Custom Instructions',
    'upload.customInstructionsPlaceholder': 'Example: Focus on enterprise buyers, emphasize ROI and security compliance. Keep slides data-driven, avoid jargon, and include a short call-to-action on the final slide.',
    
    // Language Selector
    'language.english': 'English',
    'language.chinese': '中文',
    'language.selectLanguage': 'Language',
    
    // Common
    'common.loading': 'Loading',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.copiedToClipboard': 'Copied to clipboard',
    'common.noTemplateFound': 'No template found',
    'common.advancedSettings': 'Advanced settings',
    
    // Advanced Settings Dialog
    'advanced.tone': 'Tone',
    'advanced.toneDesc': 'Controls the writing style (e.g., casual, professional, funny).',
    'advanced.selectTone': 'Select tone',
    'advanced.verbosity': 'Verbosity',
    'advanced.verbosityDesc': 'Controls how detailed slide descriptions are: concise, standard, or text-heavy.',
    'advanced.selectVerbosity': 'Select verbosity',
    'advanced.includeTableOfContents': 'Include table of contents',
    'advanced.includeTableOfContentsDesc': 'Add an index slide summarizing sections (requires 3+ slides).',
    'advanced.titleSlide': 'Title slide',
    'advanced.titleSlideDesc': 'Include a title slide as the first slide.',
    'advanced.webSearch': 'Web search',
    'advanced.webSearchDesc': 'Allow the model to consult the web for fresher facts.',
    'advanced.instructions': 'Instructions',
    'advanced.instructionsDesc': 'Optional guidance for the AI. These override defaults except format constraints.',
    'advanced.instructionsPlaceholder': 'Example: Focus on enterprise buyers, emphasize ROI and security compliance. Keep slides data-driven, avoid jargon, and include a short call-to-action on the final slide.',
    
    // Tone options
    'tone.default': 'Default',
    'tone.casual': 'Casual',
    'tone.professional': 'Professional',
    'tone.funny': 'Funny',
    'tone.educational': 'Educational',
    'tone.salesPitch': 'Sales Pitch',
    
    // Verbosity options
    'verbosity.concise': 'Concise',
    'verbosity.standard': 'Standard',
    'verbosity.textHeavy': 'Text Heavy',
    
    // Slide count
    'slides.slides': 'slides',
    'slides.selectSlides': 'Select Slides',
    
    // Language selector
    'language.selectLanguage2': 'Select language',
    'language.searchLanguage': 'Search language...',
    'language.noLanguageFound': 'No language found.',
    
    // Settings Page - Common
    'settings.apiKeyStoredLocally': 'Your API key will be stored locally and never shared',
    'settings.checkForAvailableModels': 'Check for available models',
    'settings.checkingForModels': 'Checking for models...',
    'settings.noModelsFound': 'No models found.',
    'settings.noModelsFoundDesc': 'Please make sure your API key is valid and has access to models.',
    'settings.selectModel': 'Select Model',
    'settings.selectAModel': 'Select a model',
    'settings.searchModel': 'Search model...',
    'settings.noModelFound': 'No model found.',
    'settings.selectImageProvider': 'Select Image Provider',
    'settings.pexelsApiKey': 'Pexels API Key',
    'settings.apiKeyForPexels': 'API key for Pexels image generation',
    'settings.pleaseSelectModel': 'Please Select a Model',
    'settings.pleaseEnterApiKey': 'Please Enter API Key',
    'settings.pleaseEnterOllamaUrl': 'Please Enter Ollama URL',
    'settings.selectedModels': 'Selected Models',
    'settings.usingForTextGeneration': 'Using',
    'settings.forImages': 'for images',
    'settings.and': 'and',
    
    // Settings Page - Custom LLM
    'settings.openaiCompatibleUrl': 'OpenAI Compatible URL',
    'settings.enterYourUrl': 'Enter your URL',
    'settings.openaiCompatibleApiKey': 'OpenAI Compatible API Key',
    'settings.enterYourApiKey': 'Enter your API Key',
    'settings.importantToolCalls': 'Only models with function calling capabilities (tool calls) or JSON schema support will work.',
    'settings.useToolCalls': 'Use Tool Calls',
    'settings.useToolCallsDesc': 'If enabled, Tool Calls will be used instead of JSON Schema for Structured Output.',
    'settings.disableThinking': 'Disable Thinking',
    'settings.disableThinkingDesc': 'If enabled, Thinking will be disabled.',
    
    // Settings Page - Google
    'settings.googleApiKey': 'Google API Key',
    'settings.enableWebGrounding': 'Enable Web Grounding',
    'settings.enableWebGroundingDesc': 'If enabled, the model can use web search grounding when available.',
    
    // Settings Page - OpenAI
    'settings.openaiApiKey': 'OpenAI API Key',
    'settings.enterYourOpenaiApiKey': 'Enter your API key',
    
    // Settings Page - Anthropic
    'settings.anthropicApiKey': 'Anthropic API Key',
    'settings.enterYourAnthropicApiKey': 'Enter your Anthropic API key',
    
    // Settings Page - Ollama
    'settings.useCustomOllamaUrl': 'Use custom Ollama URL',
    'settings.chooseASupportedModel': 'Choose a supported model',
    'settings.ollamaUrl': 'Ollama URL',
    'settings.enterOllamaUrl': 'Enter your Ollama URL',
    'settings.customOllamaDesc': 'Change this if you are using a custom Ollama instance',
  },
  zh: {
    // Header Navigation
    'nav.dashboard': '仪表板',
    'nav.settings': '设置',
    'nav.createTemplate': '创建模板',
    'nav.templates': '模板',
    
    // Dashboard Page
    'dashboard.title': '仪表板',
    'dashboard.noPresentations': '还没有演示文稿',
    'dashboard.noPresentationsDesc': '创建您的第一个演示文稿以开始使用',
    'dashboard.getStarted': '开始使用',
    'dashboard.recentPresentations': '最近的演示文稿',
    'dashboard.allPresentations': '所有演示文稿',
    'dashboard.createdAt': '创建时间',
    'dashboard.lastModified': '最后修改',
    'dashboard.slides': '张幻灯片',
    'dashboard.open': '打开',
    'dashboard.delete': '删除',
    'dashboard.deleteConfirm': '确定要删除此演示文稿吗？',
    'dashboard.deleteSuccess': '演示文稿删除成功',
    'dashboard.deleteFailed': '删除演示文稿失败',
    'dashboard.createNewPresentation': '创建新演示文稿',
    'dashboard.createVideoPresentation': '创建视频演示文稿',
    'dashboard.startFromScratch': '从头开始，将您的想法变为现实',
    'dashboard.tryAgain': '重试',
    
    // Template Preview Page
    'templates.allTemplates': '所有模板',
    'templates.customAITemplates': '自定义 AI 模板',
    'templates.createCustomTemplate': '创建自定义模板',
    'templates.createFirstTemplate': '创建您的第一个自定义模板',
    'templates.inbuiltTemplates': '内置模板',
    'templates.general': '通用',
    'templates.modern': '现代',
    'templates.standard': '标准',
    'templates.generalDesc': '适用于常见演示元素的通用布局',
    'templates.modernDesc': '现代白色和蓝色商业演示布局，设计简洁专业',
    'templates.standardDesc': '演示文稿的标准布局',
    'templates.layouts': '个布局',
    
    // Custom Template Page
    'customTemplate.title': '创建自定义模板',
    'customTemplate.addGoogleApiKey': '请添加 "GOOGLE_API_KEY" 以通过 AI 启用模板创建。',
    'customTemplate.addOpenAiApiKey': '请添加您的 OpenAI API 密钥以处理布局',
    'customTemplate.requiresGPT5': '此功能需要 OpenAI 模型 GPT-5。请在设置或环境变量中配置您的密钥。',
    'customTemplate.uploadSlide': '上传幻灯片',
    'customTemplate.dragDropPPTX': '将 PPTX 文件拖放到此处',
    'customTemplate.orClickToSelect': '或点击选择文件',
    'customTemplate.onlyPPTX': '仅支持 .pptx 文件',
    'customTemplate.uploadSuccess': '文件上传成功',
    'customTemplate.slides': '张幻灯片',
    'customTemplate.saveLayout': '保存布局',
    'customTemplate.saving': '保存中',
    'customTemplate.saved': '已保存',
    'customTemplate.enterLayoutName': '输入布局名称',
    'customTemplate.layoutNamePlaceholder': '我的自定义布局',
    'customTemplate.saveButton': '保存',
    'customTemplate.uploadPPTX': '上传 PDF 或 PPTX 文件',
    'customTemplate.clickToUpload': '点击上传 PDF 或 PPTX 文件',
    'customTemplate.maxFileSize': '选择 PDF 或 PowerPoint 文件（.pdf 或 .pptx）进行处理。最大文件大小：100MB',
    'customTemplate.processFile': '处理文件',
    'customTemplate.extractingSlides': '正在提取幻灯片...',
    'customTemplate.selectFile': '选择 PDF 或 PPTX 文件',
    'customTemplate.slidesCompleted': '张幻灯片已完成',
    'customTemplate.saveTemplate': '保存模板',
    'customTemplate.savingTemplate': '正在保存模板...',
    'customTemplate.templateName': '模板名称',
    'customTemplate.description': '描述',
    'customTemplate.enterTemplateName': '输入模板名称...',
    'customTemplate.enterDescription': '输入模板描述...',
    'customTemplate.descriptionForTemplate': '输入模板的名称和描述。这将帮助您以后识别它。',
    
    // Outline Page
    'outline.title': '大纲',
    'outline.generatePresentation': '生成演示文稿',
    'outline.generating': '生成中',
    'outline.editOutline': '编辑大纲',
    'outline.addSlide': '添加幻灯片',
    'outline.deleteSlide': '删除幻灯片',
    'outline.slideContent': '幻灯片内容',
    'outline.selectTemplate': '选择模板',
    'outline.noOutline': '还没有大纲',
    'outline.startCreating': '开始创建您的演示文稿',
    'outline.generatingPresentationData': '正在生成演示文稿数据...',
    'outline.inBuiltTemplates': '内置模板',
    'outline.customAITemplates': '自定义 AI 模板',
    'outline.noCustomTemplates': '没有自定义模板。从"所有模板"菜单创建一个。',
    'outline.noTemplatesAvailable': '没有可用的模板',
    'outline.noTemplatesAvailableDesc': '无法加载演示文稿模板。请尝试刷新页面。',
    'outline.layouts': '个布局',
    'outline.structured': '结构化',
    'outline.flexible': '灵活',
    
    // Application Initialization
    'app.initializing': '正在初始化应用程序',
    'app.loadingConfig': '正在加载配置并检查模型可用性...',
    
    // Home Page
    'home.saveConfiguration': '保存配置',
    'home.savingConfiguration': '正在保存配置...',
    'home.downloadingModelProgress': '正在下载模型 ({percentage}%)',
    'home.percentComplete': '{percentage}% 完成',
    'home.openSourceAIPresentationGenerator': '开源 AI 演示文稿生成器',
    
    // Presentation Page
    'presentation.title': '演示文稿',
    'presentation.present': '演示',
    'presentation.export': '导出',
    'presentation.exportPDF': '导出为 PDF',
    'presentation.exportPPTX': '导出为 PPTX',
    'presentation.exporting': '正在导出演示文稿...',
    'presentation.reGenerate': '重新生成',
    'presentation.undo': '撤销',
    'presentation.redo': '重做',
    'presentation.share': '分享',
    'presentation.addSlide': '添加幻灯片',
    'presentation.deleteSlide': '删除幻灯片',
    'presentation.duplicateSlide': '复制幻灯片',
    'presentation.moveUp': '上移',
    'presentation.moveDown': '下移',
    'presentation.editContent': '编辑内容',
    'presentation.changeLayout': '更改布局',
    'presentation.saving': '保存中...',
    'presentation.saved': '已保存',
    'presentation.autoSave': '自动保存',
    'presentation.exportError': '导出遇到问题！',
    'presentation.exportErrorDesc': '导出演示文稿时遇到问题，请重试。',
    'presentation.failedToGetPptxModel': '获取演示文稿 PPTX 模型失败',
    'presentation.failedToConvertPptxModel': '转换演示文稿为 PPTX 模型失败。请检查演示文稿是否有效。',
    'presentation.serverError': '服务器错误',
    'presentation.invalidPptxModel': '从服务器接收到无效的 PPTX 模型',
    
    // Settings Page
    'settings.title': '设置',
    'settings.saveConfiguration': '保存配置',
    'settings.savingConfiguration': '正在保存配置...',
    'settings.configurationSaved': '配置保存成功',
    'settings.failedToSave': '保存配置失败',
    'settings.downloadingModel': '正在下载模型',
    'settings.downloadComplete': '下载完成！',
    'settings.modelDownloaded': '模型下载成功！',
    'settings.complete': '完成',
    'settings.downloading': '下载中',
    'settings.verifying': '验证中',
    'settings.pulling': '拉取中',
    'settings.downloadingModelFiles': '正在下载模型文件...',
    'settings.verifyingModelIntegrity': '正在验证模型完整性...',
    'settings.pullingModelFromRegistry': '正在从仓库拉取模型...',
    'settings.downloaded': '已下载',
    'settings.total': '总计',
    
    // Upload/Create Page
    'upload.createPresentation': '创建演示文稿',
    'upload.supportingDocuments': '辅助文档',
    'upload.tellUsAboutPresentation': '告诉我们您的演示文稿需求',
    'upload.provideSpecificDetails': '提供有关演示文稿需求的具体详细信息（例如：主题、风格、要点）以获得更准确的结果',
    'upload.dragAndDrop': '拖放文件到此处或点击下方按钮',
    'upload.dropFileHere': '将文件拖放到此处',
    'upload.supportedFormats': '支持 PDF、文本文件、PPTX、DOCX',
    'upload.chooseFiles': '选择文件',
    'upload.selectedFiles': '已选择的文件',
    'upload.next': '下一步',
    'upload.filesSelected': '文件已选择',
    'upload.filesAdded': '个文件已添加',
    'upload.invalidFileType': '无效的文件类型',
    'upload.invalidFileTypeDesc': '请仅上传 PDF、TXT、PPTX 或 DOCX 文件',
    'upload.multiplePdfNotAllowed': '不允许多个 PDF 文件',
    'upload.multiplePdfNotAllowedDesc': '请仅选择一个 PDF 文件',
    'upload.selectSlidesAndLanguage': '请选择幻灯片数量和语言',
    'upload.noPromptOrDocument': '未提供提示词或文档',
    'upload.advancedSettings': '高级设置',
    'upload.customInstructions': '自定义说明',
    'upload.customInstructionsPlaceholder': '示例：专注于企业买家，强调投资回报率和安全合规性。保持幻灯片数据驱动，避免术语，并在最后一张幻灯片中包含简短的行动号召。',
    
    // Language Selector
    'language.english': 'English',
    'language.chinese': '中文',
    'language.selectLanguage': '语言',
    
    // Common
    'common.loading': '加载中',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.close': '关闭',
    'common.back': '返回',
    'common.copiedToClipboard': '已复制到剪贴板',
    'common.noTemplateFound': '未找到模板',
    'common.advancedSettings': '高级设置',
    
    // Advanced Settings Dialog
    'advanced.tone': '语气',
    'advanced.toneDesc': '控制写作风格（例如：随意、专业、幽默）。',
    'advanced.selectTone': '选择语气',
    'advanced.verbosity': '详细程度',
    'advanced.verbosityDesc': '控制幻灯片描述的详细程度：简洁、标准或详尽。',
    'advanced.selectVerbosity': '选择详细程度',
    'advanced.includeTableOfContents': '包含目录',
    'advanced.includeTableOfContentsDesc': '添加摘要各部分的索引幻灯片（需要 3 张以上幻灯片）。',
    'advanced.titleSlide': '标题幻灯片',
    'advanced.titleSlideDesc': '将标题幻灯片作为第一张幻灯片。',
    'advanced.webSearch': '网络搜索',
    'advanced.webSearchDesc': '允许模型查询网络以获取更新的事实。',
    'advanced.instructions': '说明',
    'advanced.instructionsDesc': 'AI 的可选指导。除格式限制外，这些将覆盖默认设置。',
    'advanced.instructionsPlaceholder': '示例：专注于企业买家，强调投资回报率和安全合规性。保持幻灯片数据驱动，避免术语，并在最后一张幻灯片中包含简短的行动号召。',
    
    // Tone options
    'tone.default': '默认',
    'tone.casual': '随意',
    'tone.professional': '专业',
    'tone.funny': '幽默',
    'tone.educational': '教育',
    'tone.salesPitch': '销售推销',
    
    // Verbosity options
    'verbosity.concise': '简洁',
    'verbosity.standard': '标准',
    'verbosity.textHeavy': '详尽',
    
    // Slide count
    'slides.slides': '张幻灯片',
    'slides.selectSlides': '选择幻灯片数量',
    
    // Language selector
    'language.selectLanguage2': '选择语言',
    'language.searchLanguage': '搜索语言...',
    'language.noLanguageFound': '未找到语言。',
    
    // Settings Page - Common
    'settings.apiKeyStoredLocally': '您的 API 密钥将在本地存储，永不共享',
    'settings.checkForAvailableModels': '检查可用模型',
    'settings.checkingForModels': '正在检查模型...',
    'settings.noModelsFound': '未找到模型。',
    'settings.noModelsFoundDesc': '请确保您的 API 密钥有效且有权访问模型。',
    'settings.selectModel': '选择模型',
    'settings.selectAModel': '选择一个模型',
    'settings.searchModel': '搜索模型...',
    'settings.noModelFound': '未找到模型。',
    'settings.selectImageProvider': '选择图片提供商',
    'settings.pexelsApiKey': 'Pexels API 密钥',
    'settings.apiKeyForPexels': '用于 Pexels 图片生成的 API 密钥',
    'settings.pleaseSelectModel': '请选择模型',
    'settings.pleaseEnterApiKey': '请输入 API 密钥',
    'settings.pleaseEnterOllamaUrl': '请输入 Ollama URL',
    'settings.selectedModels': '已选择的模型',
    'settings.usingForTextGeneration': '使用',
    'settings.forImages': '用于图片',
    'settings.and': '和',
    
    // Settings Page - Custom LLM
    'settings.openaiCompatibleUrl': 'OpenAI 兼容 URL',
    'settings.enterYourUrl': '输入您的 URL',
    'settings.openaiCompatibleApiKey': 'OpenAI 兼容 API 密钥',
    'settings.enterYourApiKey': '输入您的 API 密钥',
    'settings.importantToolCalls': '重要：仅支持具有函数调用功能（工具调用）或 JSON 模式支持的模型。',
    'settings.useToolCalls': '使用工具调用',
    'settings.useToolCallsDesc': '如果启用，将使用工具调用而不是 JSON 模式来实现结构化输出。',
    'settings.disableThinking': '禁用思考过程',
    'settings.disableThinkingDesc': '如果启用，将禁用思考过程。',
    
    // Settings Page - Google
    'settings.googleApiKey': 'Google API 密钥',
    'settings.enableWebGrounding': '启用网络检索',
    'settings.enableWebGroundingDesc': '如果启用，模型可以在可用时使用网络搜索检索。',
    
    // Settings Page - OpenAI
    'settings.openaiApiKey': 'OpenAI API 密钥',
    'settings.enterYourOpenaiApiKey': '输入您的 API 密钥',
    
    // Settings Page - Anthropic
    'settings.anthropicApiKey': 'Anthropic API 密钥',
    'settings.enterYourAnthropicApiKey': '输入您的 Anthropic API 密钥',
    
    // Settings Page - Ollama
    'settings.useCustomOllamaUrl': '使用自定义 Ollama URL',
    'settings.chooseASupportedModel': '选择支持的模型',
    'settings.ollamaUrl': 'Ollama URL',
    'settings.enterOllamaUrl': '输入您的 Ollama URL',
    'settings.customOllamaDesc': '如果您使用自定义 Ollama 实例，请更改此设置',
  },
};

