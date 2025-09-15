import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileText, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Webhook URL - can be easily changed
const WEBHOOK_URL = 'https://ai.alifarvardin.ir/webhook-test/SendToDb';

interface FileUpload {
  id: string;
  file: File;
  name: string;
  size: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  membershipNumber: string;
  nationalId: string;
  fileTitle: string;
  phoneNumber: string;
  cadastralCode: string;
  licenseNumber: string;
  description: string;
}

const EngineeringForm: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    membershipNumber: '',
    nationalId: '',
    fileTitle: '',
    phoneNumber: '',
    cadastralCode: '',
    licenseNumber: '',
    description: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "نوع فایل غیرمجاز",
          description: "فقط فایل‌های PDF, DOC و DOCX مجاز هستند.",
          variant: "destructive"
        });
        return;
      }

      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "حجم فایل زیاد",
          description: "حجم فایل باید کمتر از 2 مگابایت باشد.",
          variant: "destructive"
        });
        return;
      }

      const newFile: FileUpload = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size
      };

      setUploadedFiles(prev => [...prev, newFile]);
    });

    // Reset input
    event.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'membershipNumber', 'nationalId', 
      'fileTitle', 'phoneNumber', 'cadastralCode'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof FormData].trim()) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "خطا در ارسال",
        description: "لطفاً تمام فیلدهای اجباری را پر کنید.",
        variant: "destructive"
      });
      return;
    }

    // Check total file size (multiple files shouldn't exceed 8MB total)
    const totalFileSize = uploadedFiles.reduce((total, file) => total + file.size, 0);
    const maxTotalSize = 8 * 1024 * 1024; // 8MB
    
    if (totalFileSize > maxTotalSize) {
      toast({
        title: "خطا در ارسال",
        description: "مجموع حجم فایل‌ها نباید از 8 مگابایت بیشتر باشد.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // If multiple files, send them one by one to avoid payload size issues
      if (uploadedFiles.length > 1) {
        await handleMultipleFileSubmission();
      } else {
        await handleSingleSubmission();
      }

      toast({
        title: "موفقیت",
        description: "اطلاعات با موفقیت ارسال شد.",
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        membershipNumber: '',
        nationalId: '',
        fileTitle: '',
        phoneNumber: '',
        cadastralCode: '',
        licenseNumber: '',
        description: '',
      });
      setUploadedFiles([]);

    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "خطا در ارسال",
        description: error instanceof Error ? error.message : "خطای ناشناخته رخ داد.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSingleSubmission = async () => {
    const submitData = new FormData();
    
    // Add form fields
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });
    
    // Add submission timestamp
    submitData.append('submittedAt', new Date().toISOString());
    
    // Add file if exists
    if (uploadedFiles.length > 0) {
      submitData.append('file_0', uploadedFiles[0].file);
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'cors',
      body: submitData,
    });

    if (!response.ok) {
      throw new Error(`خطای سرور: ${response.status} - ${response.statusText}`);
    }
  };

  const handleMultipleFileSubmission = async () => {
    // Send form data with first file
    const firstSubmitData = new FormData();
    
    // Add form fields
    Object.entries(formData).forEach(([key, value]) => {
      firstSubmitData.append(key, value);
    });
    
    // Add submission timestamp
    firstSubmitData.append('submittedAt', new Date().toISOString());
    firstSubmitData.append('totalFiles', uploadedFiles.length.toString());
    firstSubmitData.append('fileIndex', '0');
    
    // Add first file
    firstSubmitData.append('file_0', uploadedFiles[0].file);

    const firstResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'cors',
      body: firstSubmitData,
    });

    if (!firstResponse.ok) {
      throw new Error(`خطای سرور در ارسال فایل اول: ${firstResponse.status}`);
    }

    // Send remaining files separately
    for (let i = 1; i < uploadedFiles.length; i++) {
      const additionalFileData = new FormData();
      
      // Add identifying information
      additionalFileData.append('membershipNumber', formData.membershipNumber);
      additionalFileData.append('nationalId', formData.nationalId);
      additionalFileData.append('submittedAt', new Date().toISOString());
      additionalFileData.append('fileIndex', i.toString());
      additionalFileData.append('totalFiles', uploadedFiles.length.toString());
      additionalFileData.append('isAdditionalFile', 'true');
      
      // Add file
      additionalFileData.append(`file_${i}`, uploadedFiles[i].file);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'cors',
        body: additionalFileData,
      });

      if (!response.ok) {
        throw new Error(`خطای سرور در ارسال فایل ${i + 1}: ${response.status}`);
      }

      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            سازمان نظام مهندسی معدن استان خراسان رضوی
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl text-foreground">
              فرم ارسال اطلاعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">نام *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="نام خود را وارد کنید"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">نام خانوادگی *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="نام خانوادگی خود را وارد کنید"
                    required
                  />
                </div>
              </div>

              {/* Membership and ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="membershipNumber">شماره عضویت *</Label>
                  <Input
                    id="membershipNumber"
                    type="text"
                    value={formData.membershipNumber}
                    onChange={(e) => handleInputChange('membershipNumber', e.target.value)}
                    placeholder="شماره عضویت"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nationalId">کد ملی *</Label>
                  <Input
                    id="nationalId"
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => handleInputChange('nationalId', e.target.value)}
                    placeholder="کد ملی"
                    required
                  />
                </div>
              </div>

              {/* File Title and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fileTitle">عنوان فایل ارسالی *</Label>
                  <Select value={formData.fileTitle} onValueChange={(value) => handleInputChange('fileTitle', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="گزارش">گزارش</SelectItem>
                      <SelectItem value="طرح">طرح</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phoneNumber">شماره تماس *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="09xxxxxxxxx"
                    required
                  />
                </div>
              </div>

              {/* Codes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cadastralCode">کد کاداستر یا شناسایی *</Label>
                  <Input
                    id="cadastralCode"
                    type="text"
                    value={formData.cadastralCode}
                    onChange={(e) => handleInputChange('cadastralCode', e.target.value)}
                    placeholder="کد کاداستر یا شناسایی"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">شماره پروانه (اختیاری)</Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    placeholder="شماره پروانه"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="توضیحات تکمیلی..."
                  rows={4}
                />
              </div>

              {/* File Upload */}
              <div>
                <Label>آپلود فایل (PDF, DOC, DOCX - حداکثر 2 مگابایت)</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-medium">برای آپلود کلیک کنید</span>
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (حداکثر 2MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">فایل‌های انتخاب شده:</h4>
                    {uploadedFiles.map((fileUpload) => (
                      <div
                        key={fileUpload.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{fileUpload.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(fileUpload.size)})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileUpload.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2 text-lg"
                >
                  {isSubmitting ? 'در حال ارسال...' : 'ارسال'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EngineeringForm;