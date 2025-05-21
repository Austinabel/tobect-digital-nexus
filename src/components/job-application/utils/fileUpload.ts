
import { supabase } from '@/integrations/supabase/client';

export const uploadResume = async (resumeFile: File, fullName: string): Promise<string> => {
  const timestamp = new Date().getTime();
  const fileExt = resumeFile.name.split('.').pop();
  const filePath = `${fullName.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.${fileExt}`;
  
  const { data: fileData, error: fileError } = await supabase.storage
    .from('resumes')
    .upload(filePath, resumeFile);
    
  if (fileError) {
    throw new Error(fileError.message);
  }
  
  // Get the public URL of the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(filePath);
  
  return publicUrlData.publicUrl;
};
