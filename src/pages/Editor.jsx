import { useState, useRef } from 'react';
import { Sparkles, Send, ImagePlus, X } from 'lucide-react';

export default function Editor() {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Gère la sélection des fichiers et génère des URL temporaires pour la prévisualisation
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
  };

  // Supprime une image de la liste de prévisualisation
  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Nouvelle Publication</h2>
        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Sparkles size={18} />
          Générer avec Spring AI
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-6 space-y-6 transition-colors">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre de la publication</label>
          <input type="text" placeholder="Ex: Déploiement de notre nouvelle API..." 
                 className="w-full px-4 py-2 bg-transparent border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white dark:placeholder-gray-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contenu</label>
          <textarea rows="6" placeholder="Rédigez votre contenu ou laissez l'IA le générer..."
                    className="w-full px-4 py-2 bg-transparent border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none dark:text-white dark:placeholder-gray-500"></textarea>
          
          {/* Barre d'outils sous le textarea */}
          <div className="flex items-center gap-4 mt-3">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ImagePlus size={18} />
              Ajouter des images
            </button>
          </div>

          {/* Grille de prévisualisation des images */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((img, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border dark:border-gray-700 aspect-video">
                  <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-gray-900/70 hover:bg-red-600 text-white p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4 border-t dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Plateformes cibles</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer dark:text-gray-300">
                <input type="checkbox" className="rounded text-blue-600 w-4 h-4 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600" defaultChecked />
                <span>LinkedIn</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer dark:text-gray-300">
                <input type="checkbox" className="rounded text-blue-600 w-4 h-4 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600" />
                <span>WordPress</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Planification</label>
            <input type="datetime-local" className="w-full px-4 py-2 bg-transparent border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            <Send size={18} />
            Planifier la publication
          </button>
        </div>
      </div>
    </div>
  );
}