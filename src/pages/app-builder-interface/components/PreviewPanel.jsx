import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import AdStrategyService from '../../../services/adStrategyService';
import { useAuth } from '../../../contexts/AuthContext';

const PreviewPanel = ({ selectedAd, isGenerating, productData, generatedAds = [], onSelectAd }) => {
  // Existing states for ad examples slider
  const [adExamples, setAdExamples] = useState([]);
  const [selectedAdIndex, setSelectedAdIndex] = useState(0);
  const [adSelected, setAdSelected] = useState(false);

  // NEW: Image upload states
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  // NEW: Ad saving states
  const [isSavingAd, setIsSavingAd] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const { user } = useAuth();

  // Update ad examples when generatedAds change
  useEffect(() => {
    if (generatedAds?.length > 0) {
      // Ensure we have exactly 3 examples (pad with variations if needed)
      const examples = generatedAds?.slice(0, 3) || [];
      
      // If we have fewer than 3, create variations or use fallback data
      while (examples?.length < 3) {
        const baseAd = examples?.[0] || {
          headline: "Entdecke unser Top-Produkt",
          primary_text: "Revolutioniere deinen Alltag mit unserem innovativen Produkt. Jetzt 30% sparen!",
          cta: "Jetzt kaufen",
          visual_suggestion: "Produktbild in modernem Setup",
          emotional_trigger: "Neugier",
          conversion_score: 85 + Math.floor(Math.random() * 10),
          estimated_ctr: 2.1 + Math.random() * 1.5
        };
        
        // Create variation with different emotional triggers and scores
        const variations = [
          {
            ...baseAd,
            emotional_trigger: "Dringlichkeit",
            conversion_score: 88 + Math.floor(Math.random() * 8),
            estimated_ctr: 2.5 + Math.random() * 1.2,
            primary_text: baseAd?.primary_text?.replace("Jetzt", "Nur heute")
          },
          {
            ...baseAd,
            emotional_trigger: "Motivation",
            conversion_score: 91 + Math.floor(Math.random() * 7),
            estimated_ctr: 2.8 + Math.random() * 1.0,
            headline: baseAd?.headline?.replace("Entdecke", "Verwirkliche deine Ziele mit")
          }
        ];
        
        examples?.push(variations?.[examples?.length - 1] || baseAd);
      }
      
      setAdExamples(examples);
      setSelectedAdIndex(0);
    }
  }, [generatedAds]);

  // NEW: Enhanced handleSelectAd with save functionality
  const handleAcceptAd = async (index) => {
    if (!user?.id) {
      setSaveError('Bitte melden Sie sich an, um Anzeigen zu speichern');
      return;
    }

    setIsSavingAd(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const selectedAdVariant = adExamples?.[index];
      if (!selectedAdVariant) {
        throw new Error('Keine Anzeige ausgewählt');
      }

      // Upload custom image if available
      let customImageUrl = null;
      if (uploadedImage) {
        const { data: imageData, error: imageError } = await AdStrategyService.uploadAdImage(uploadedImage, user?.id);
        if (imageError) {
          console.error('Image upload error:', imageError);
          // Continue without custom image
        } else {
          customImageUrl = imageData?.publicUrl;
        }
      }

      // Save ad variant with all relevant data
      const { data: savedAd, error: saveError } = await AdStrategyService?.saveAdVariant(
        selectedAdVariant,
        productData,
        {
          customImageUrl,
          notes: `Übernommen ${uploadedImage ? 'mit eigenem Bild' : 'ohne eigenes Bild'} - ${new Date().toLocaleDateString('de-DE')}`
        }
      );

      if (saveError) throw saveError;

      setSaveSuccess(true);
      setAdSelected(true);

      // Auto-hide success message
      setTimeout(() => {
        setSaveSuccess(false);
        setAdSelected(false);
      }, 3000);

      // Optional: Trigger callback to parent component
      if (onSelectAd) {
        onSelectAd({
          ...selectedAdVariant,
          saved: true,
          savedId: savedAd?.id
        });
      }

    } catch (error) {
      console.error('Error accepting ad:', error);
      setSaveError(error?.message || 'Fehler beim Speichern der Anzeige');
    } finally {
      setIsSavingAd(false);
    }
  };

  // ENHANCED: Auto-select ad when clicking indicator dots
  const handleDotClick = (index) => {
    setSelectedAdIndex(index);
    // Automatically update preview when using dots navigation
    const selectedAdVariant = adExamples?.[index];
    if (onSelectAd && selectedAdVariant) {
      onSelectAd(selectedAdVariant);
    }
  };

  // Navigation functions with automatic preview updates
  const goToPrevious = () => {
    const newIndex = selectedAdIndex === 0 ? adExamples?.length - 1 : selectedAdIndex - 1;
    setSelectedAdIndex(newIndex);
    // Auto-update preview
    if (onSelectAd && adExamples?.[newIndex]) {
      onSelectAd(adExamples?.[newIndex]);
    }
  };

  const goToNext = () => {
    const newIndex = selectedAdIndex === adExamples?.length - 1 ? 0 : selectedAdIndex + 1;
    setSelectedAdIndex(newIndex);
    // Auto-update preview
    if (onSelectAd && adExamples?.[newIndex]) {
      onSelectAd(adExamples?.[newIndex]);
    }
  };

  // NEW: Handle image upload
  const handleImageUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file?.type?.match(/^image\/(png|jpe?g)$/i)) {
      alert('Bitte wählen Sie eine PNG- oder JPG-Datei aus.');
      return;
    }

    // Validate file size (max 5MB)
    if (file?.size > 5 * 1024 * 1024) {
      alert('Die Datei ist zu groß. Bitte wählen Sie eine Datei unter 5MB.');
      return;
    }

    setIsImageUploading(true);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImagePreview(e?.target?.result);
      setUploadedImage(file);
      setIsImageUploading(false);
    };
    reader?.readAsDataURL(file);
  };

  // NEW: Remove uploaded image
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedImagePreview(null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  // NEW: Trigger file input
  const triggerImageUpload = () => {
    fileInputRef?.current?.click();
  };

  const currentAd = adExamples?.[selectedAdIndex] || selectedAd;
  
  const mockFacebookData = currentAd?.facebook_preview_data || {
    page_name: 'Ihr Unternehmen',
    image_placeholder: 'Produktbild',
    likes: 847,
    shares: 23,
    comments: 156
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000)?.toFixed(1) + 'k';
    }
    return num?.toString();
  };

  return (
    <motion.div 
      className="bg-card border border-border rounded-lg p-6 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
            <Icon name="Smartphone" size={20} className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Live-Vorschau</h2>
            <p className="text-sm text-muted-foreground">
              {adExamples?.length > 0 ? `${adExamples?.length} AI-generierte Varianten` : 'Facebook-Stil Anzeigenvorschau'}
            </p>
          </div>
        </div>
        
        {/* Navigation arrows for slider */}
        {adExamples?.length > 1 && (
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={goToPrevious}
              className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon name="ChevronLeft" size={16} className="text-muted-foreground" />
            </motion.button>
            <motion.button
              onClick={goToNext}
              className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </motion.button>
          </div>
        )}
      </div>
      {/* ENHANCED: Indicator dots with auto-selection */}
      {adExamples?.length > 1 && (
        <div className="flex justify-center space-x-2 mb-4">
          {adExamples?.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === selectedAdIndex 
                  ? 'bg-primary w-6' :'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
      {/* NEW: Image Upload Section */}
      <motion.div 
        className="mb-6 p-4 border-2 border-dashed border-border rounded-lg bg-muted/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center">
          <h3 className="font-medium text-foreground mb-2 flex items-center justify-center space-x-2">
            <Icon name="Upload" size={16} className="text-primary" />
            <span>Eigenes Bild hochladen</span>
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Laden Sie ein PNG- oder JPG-Bild hoch, um zu sehen, wie Ihre finale Anzeige aussieht
          </p>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {uploadedImagePreview ? (
            /* Uploaded image preview */
            (<div className="space-y-3">
              <div className="relative inline-block">
                <img 
                  src={uploadedImagePreview} 
                  alt="Hochgeladenes Bild"
                  className="w-32 h-20 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/80"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={triggerImageUpload}
                  className="text-xs"
                >
                  <Icon name="RefreshCw" size={14} className="mr-1" />
                  Ersetzen
                </Button>
              </div>
            </div>)
          ) : (
            /* Upload button */
            (<div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={triggerImageUpload}
                disabled={isImageUploading}
                className="w-full"
              >
                {isImageUploading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Wird hochgeladen...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={16} className="mr-2" />
                    Bild auswählen
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG oder JPG, max. 5MB
              </p>
            </div>)
          )}
        </div>
      </motion.div>
      {/* NEW: Success and Error Messages */}
      {saveSuccess && (
        <motion.div 
          className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} />
            <span className="text-sm font-medium">✅ Anzeige erfolgreich gespeichert!</span>
          </div>
        </motion.div>
      )}
      {saveError && (
        <motion.div 
          className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} />
            <span className="text-sm">{saveError}</span>
          </div>
        </motion.div>
      )}
      {/* Mobile Facebook Preview with Animation */}
      <div className="max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${selectedAdIndex}-${uploadedImagePreview ? 'custom' : 'default'}`}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden relative transition-colors"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Facebook Header */}
            <div className="p-3 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm">
                      {mockFacebookData?.page_name}
                    </h3>
                    <div className="w-1 h-1 bg-gray-400 dark:bg-slate-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-slate-400">Gesponsert</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Vor 2 Std.</p>
                </div>
                <button className="p-1">
                  <Icon name="MoreHorizontal" size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-3">
              {/* Primary Text */}
              {currentAd ? (
                <p className="text-sm text-gray-900 dark:text-slate-50 leading-relaxed mb-3">
                  {currentAd?.primary_text}
                </p>
              ) : isGenerating ? (
                <div className="space-y-2 mb-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic mb-3">
                  Anzeigentext wird hier angezeigt...
                </p>
              )}

              {/* ENHANCED: Image Preview with custom upload support */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-lg h-48 flex flex-col items-center justify-center mb-3 border border-gray-200 dark:border-slate-700 relative overflow-hidden">
                {uploadedImagePreview ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={uploadedImagePreview} 
                      alt="Hochgeladenes Anzeigenbild"
                      className="w-full h-full object-cover"
                    />
                    {/* Custom image overlay indicator */}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                      <Icon name="Check" size={12} className="inline mr-1" />
                      Eigenes Bild
                    </div>
                  </div>
                ) : (
                  <>
                    <Icon name="Image" size={32} className="text-gray-400 dark:text-slate-500 mb-2" />
                    <p className="text-xs text-gray-500 dark:text-slate-300 text-center px-4">
                      {currentAd ? (
                        <>Bildvorschlag: {currentAd?.visual_suggestion?.substring(0, 60)}...</>
                      ) : (
                        'Bildvorschlag: {imagePrompt}'
                      )}
                    </p>
                  </>
                )}
              </div>

              {/* Headline and Description - Direct Integration without gray background */}
              <div className="mb-3">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-slate-50 mb-1">
                  {currentAd?.headline || productData?.product_name || 'Headline wird hier angezeigt'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-slate-300 mb-2">
                  {productData?.product_description?.substring(0, 100) || 'Produktbeschreibung...'}...
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">ihr-unternehmen.de</p>
              </div>

              {/* CTA Button */}
              <div className="mt-3">
                <button 
                  className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
                  disabled
                >
                  {currentAd?.cta || productData?.cta_text || 'Call-to-Action'}
                </button>
              </div>
            </div>

            {/* Engagement Bar */}
            <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="flex -space-x-1">
                      <div className="w-4 h-4 bg-blue-500 rounded-full border border-white dark:border-slate-900 flex items-center justify-center">
                        <Icon name="ThumbsUp" size={8} className="text-white" />
                      </div>
                      <div className="w-4 h-4 bg-red-500 rounded-full border border-white dark:border-slate-900 flex items-center justify-center">
                        <Icon name="Heart" size={8} className="text-white" />
                      </div>
                    </div>
                    <span>{formatNumber(mockFacebookData?.likes || 847)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span>{formatNumber(mockFacebookData?.comments || 156)} Kommentare</span>
                  <span>{formatNumber(mockFacebookData?.shares || 23)} Mal geteilt</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-700">
              <div className="flex justify-around">
                {['Like', 'Kommentieren', 'Teilen']?.map((action, index) => (
                  <button 
                    key={action}
                    className="flex items-center justify-center space-x-1 py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex-1"
                    disabled
                  >
                    <Icon 
                      name={index === 0 ? 'ThumbsUp' : index === 1 ? 'MessageCircle' : 'Share'} 
                      size={16} 
                      className="text-gray-500 dark:text-slate-300" 
                    />
                    <span className="text-sm text-gray-600 dark:text-slate-200">{action}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversion Score Badge */}
            {currentAd?.conversion_score && (
              <div className="absolute top-3 right-3">
                <div className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                  {currentAd?.conversion_score}%
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ENHANCED: Ad Selection Button with Save Functionality */}
        {adExamples?.length > 0 && (
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              className={`w-full transition-all duration-300 ${
                saveSuccess 
                  ? 'bg-green-500 hover:bg-green-600 text-white' :
                adSelected 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' :'bg-[#C80000] hover:bg-[#C80000]/90 text-white'
              }`}
              onClick={() => handleAcceptAd(selectedAdIndex)}
              disabled={isSavingAd || saveSuccess}
            >
              {isSavingAd ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Wird gespeichert...
                </>
              ) : saveSuccess ? (
                <>
                  <Icon name="Check" size={16} className="mr-2" />
                  Gespeichert ✅
                </>
              ) : adSelected ? (
                <>
                  <Icon name="Target" size={16} className="mr-2" />
                  Ausgewählt
                </>
              ) : (
                <>
                  <Icon name="Heart" size={16} className="mr-2" />
                  Ad übernehmen
                </>
              )}
            </Button>
            
            {!user?.id && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Melden Sie sich an, um Anzeigen zu speichern
              </p>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            className="w-full"
            disabled={!currentAd}
            onClick={() => {
              // TODO: Implement save functionality
              if (currentAd) {
                console.log('Saving ad:', currentAd);
                if (uploadedImage) {
                  console.log('With custom image:', uploadedImage?.name);
                }
              }
            }}
          >
            <Icon name="Save" size={16} className="mr-2" />
            Ad speichern
          </Button>
        </div>

        {/* Performance Metrics */}
        {currentAd && (
          <motion.div 
            className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center space-x-2">
              <Icon name="BarChart3" size={16} className="text-green-600" />
              <span>Performance-Prognose</span>
            </h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {currentAd?.conversion_score || 0}%
                </div>
                <div className="text-xs text-gray-600">Conversion Score</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {currentAd?.estimated_ctr?.toFixed(1) || '2.1'}%
                </div>
                <div className="text-xs text-gray-600">Geschätzte CTR</div>
              </div>
            </div>
            
            {/* Emotional Trigger Tag */}
            {currentAd?.emotional_trigger && (
              <div className="mt-3 flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Emotion: {currentAd?.emotional_trigger}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-amber-800 mb-2 flex items-center space-x-2">
            <Icon name="Lightbulb" size={16} className="text-amber-600" />
            <span>Optimierungs-Tipp</span>
          </h4>
          <p className="text-xs text-amber-700">
            {uploadedImage ? 
              'Perfekt! Mit Ihrem eigenen Bild können Sie die tatsächliche Performance Ihrer Anzeige besser einschätzen. Achten Sie auf hohe Bildqualität und relevanten Inhalt.' :
              currentAd ? 
                `Diese Anzeige nutzt "${currentAd?.emotional_trigger}" als emotionalen Trigger. Für bessere Performance können Sie A/B-Tests mit verschiedenen Bildvarianten durchführen.` :
                'Wählen Sie eine generierte Anzeige aus, um spezifische Optimierungstipps zu erhalten.'
            }
          </p>
        </div>

        {/* NEW: Custom Image Integration Note */}
        {uploadedImagePreview && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-800 mb-1 flex items-center">
              <Icon name="Image" size={14} className="mr-1" />
              Bild wird mit gespeichert
            </h4>
            <p className="text-xs text-blue-700">
              Ihr hochgeladenes Bild wird zusammen mit der Anzeige gespeichert und in der Strategien-Übersicht angezeigt.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PreviewPanel;
