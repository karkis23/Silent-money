import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function ImageUpload({ onUpload, bucket = 'assets', label = 'Upload Image', currentUrl = '', acceptTypes = 'image/*' }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentUrl);

    const handleUpload = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select a file to upload.');
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
            alert('Error uploading file: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const isPDF = preview && preview.toLowerCase().endsWith('.pdf');
    const isImage = preview && !isPDF;

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest pl-1">{label}</label>
            <div className={`relative group border-2 border-dashed ${preview ? 'border-primary-300' : 'border-charcoal-200'} rounded-2xl p-4 transition-all hover:border-primary-400 bg-charcoal-50/50 overflow-hidden flex items-center justify-center ${preview ? 'min-h-[100px]' : 'min-h-[140px]'}`}>
                {preview ? (
                    <div className="relative w-full">
                        {isImage ? (
                            <div className="relative w-full h-32 rounded-xl overflow-hidden">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-charcoal-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="cursor-pointer bg-white text-charcoal-900 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                        Replace
                                        <input
                                            type="file"
                                            accept={acceptTypes}
                                            onChange={handleUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-2 py-3">
                                <div className="text-3xl">📄</div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                                        ✓ Document Uploaded
                                    </div>
                                    <a
                                        href={preview}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] text-primary-600 hover:text-primary-700 font-medium underline block"
                                    >
                                        View File
                                    </a>
                                </div>
                                <label className="cursor-pointer inline-block bg-charcoal-900 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-primary-600 transition-all">
                                    Replace
                                    <input
                                        type="file"
                                        accept={acceptTypes}
                                        onChange={handleUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                ) : (
                    <label className="cursor-pointer text-center space-y-2 py-4 w-full">
                        <div className="text-3xl">📎</div>
                        <div className="text-[10px] font-black text-charcoal-400 uppercase tracking-wider leading-relaxed">
                            {uploading ? 'Uploading...' : 'Click to Select File'}
                            <br />
                            <span className="font-medium normal-case text-[9px] text-charcoal-300">
                                {acceptTypes.includes('pdf') ? '(PDF, PNG, JPG)' : '(PNG, JPG)'}
                            </span>
                        </div>
                        <input
                            type="file"
                            accept={acceptTypes}
                            onChange={handleUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="text-center space-y-2">
                            <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                            <div className="text-[9px] font-black text-charcoal-600 uppercase tracking-wider">Uploading...</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
