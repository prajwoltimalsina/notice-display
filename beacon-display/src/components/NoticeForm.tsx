import { useState } from "react";
import { useMongoAuth } from "@/hooks/useMongoAuth";
import { useNotices } from "@/hooks/useNotices";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Upload, Loader2, X, FileText, Image } from "lucide-react";
import { toast } from "sonner";

interface NoticeFormProps {
  onSuccess?: () => void;
}

interface FileWithPreview {
  file: File;
  preview: string | null;
  title: string;
}

const MAX_TITLE_LENGTH = 200;

export function NoticeForm({ onSuccess }: NoticeFormProps) {
  const { user } = useMongoAuth();
  const { createNotice } = useNotices();
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "application/pdf",
    ];

    const validFiles = selectedFiles.filter((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid file type`);
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
      const fileWithPreview: FileWithPreview = {
        file,
        preview: null,
        title: file.name.split(".")[0],
      };

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? { ...f, preview: e.target?.result as string }
                : f,
            ),
          );
        };
        reader.readAsDataURL(file);
      }

      setFiles((prev) => [...prev, fileWithPreview]);
    });

    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileTitle = (index: number, title: string) => {
    const trimmedTitle = title.slice(0, MAX_TITLE_LENGTH);
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, title: trimmedTitle } : f)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 || !user) {
      toast.error("Please select at least one file");
      return;
    }

    setIsLoading(true);
    try {
      for (const { file, title } of files) {
        await createNotice(file, {
          title: title || file.name,
          is_published: isPublished,
          created_by: user._id,
        });
      }

      toast.success(`${files.length} notice(s) created successfully`);
      setIsPublished(true);
      setFiles([]);
      onSuccess?.();
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Upload Files (PNG, JPG, JPEG, PDF)</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            multiple
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                Click to upload multiple files (PNG, JPG, PDF)
              </span>
            </div>
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <Label>Selected Files ({files.length})</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((fileItem, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
              >
                {fileItem.preview ? (
                  <img
                    src={fileItem.preview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/20 rounded flex items-center justify-center">
                    {fileItem.file.type === "application/pdf" ? (
                      <FileText className="w-6 h-6 text-primary" />
                    ) : (
                      <Image className="w-6 h-6 text-primary" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Input
                    value={fileItem.title}
                    onChange={(e) => updateFileTitle(index, e.target.value)}
                    placeholder="Notice title"
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {fileItem.file.name}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch
            id="is_published"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
          <Label htmlFor="is_published">Publish immediately</Label>
        </div>
        <Button
          type="submit"
          variant="glow"
          disabled={isLoading || files.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </>
          ) : (
            `Create ${files.length} Notice(s)`
          )}
        </Button>
      </div>
    </form>
  );
}
