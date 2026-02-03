import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function ImageUpload({ onUpload, bucket = 'assets', label = 'Upload Image', currentUrl = '' }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentUrl);

    const handleUpload = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            setPreview(publicUrl);
            onUpload(publicUrl);
        } catch (error) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">{label}</label>
            <div className={`relative group border-2 border-dashed ${preview ? 'border-primary-200' : 'border-charcoal-100'} rounded-3xl p-4 transition-all hover:border-primary-400 bg-charcoal-50/30 overflow-hidden min-h-[160px] flex items-center justify-center`}>
                {preview ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-charcoal-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white text-charcoal-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                {uploading ? 'Processing...' : 'Replace Matrix Asset'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                ) : (
                    <label className="cursor-pointer text-center space-y-3 p-8">
                        <div className="text-4xl">📸</div>
                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest leading-relaxed">
                            {uploading ? 'Uploading to Grid...' : 'Select Intelligence Asset'}
                            <br />
                            <span className="font-medium normal-case">(PNG, JPG up to 5MB)</span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
