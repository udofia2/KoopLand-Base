"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CategoryBadge } from "@/components/CategoryBadge";
import { categories, Category, Chain } from "@/lib/types";
import { Upload, X } from "lucide-react";

const createIdeaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image: z.string().url("Valid image URL is required"),
  categories: z
    .array(
      z.enum([
        "DeFi",
        "AI",
        "SocialFi",
        "DAO",
        "Gaming",
        "NFTs",
        "Infrastructure",
        "Other",
      ] as const)
    )
    .min(1, "Select at least 1 category")
    .max(3, "Select maximum 3 categories"),
  preferredChain: z.enum([
    "ethereum",
    "polygon",
    "arbitrum",
    "optimism",
    "sepolia",
  ] as const),
  preview: z
    .string()
    .min(1, "Preview is required")
    .refine((text) => {
      const words = text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      return words.length <= 150;
    }, "Preview must be 150 words or fewer"),

  fullContent: z
    .string()
    .min(1, "Full content is required")
    .refine((text) => {
      const words = text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      return words.length <= 3000;
    }, "Full content must be 3000 words or fewer"),
});

type CreateIdeaFormData = z.infer<typeof createIdeaSchema>;

export default function CreateIdeaPage() {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateIdeaFormData>({
    resolver: zodResolver(createIdeaSchema),
    defaultValues: {
      categories: [],
      preferredChain: "ethereum",
    },
  });

  const preview = watch("preview");
  const fullContent = watch("fullContent");
  const title = watch("title");
  const image = watch("image");

  const previewWordCount = preview
    ? preview
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    : 0;
  const fullContentWordCount = fullContent
    ? fullContent
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    : 0;

  const toggleCategory = (category: Category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : selectedCategories.length < 3
      ? [...selectedCategories, category]
      : selectedCategories;

    setSelectedCategories(newCategories);
    setValue("categories", newCategories as any);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setIsUploadingImage(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please sign in first");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to upload image");
        setImageFile(null);
        setImagePreview(null);
        return;
      }

      // Set the uploaded image URL in the form
      setValue("image", result.url, { shouldValidate: true });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue("image", "");
  };

  const onSubmit = async (data: CreateIdeaFormData) => {
    // Check wallet connection
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Get user info from localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("Please sign in first");
      router.push("/login");
      return;
    }

    const user = JSON.parse(userStr);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please sign in first");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/ideas/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          image: data.image,
          categories: data.categories,
          preview: data.preview,
          fullContent: data.fullContent,
          sellerWalletAddress: address,
          preferredChain: data.preferredChain,
          sellerName: user.name,
          sellerTwitter: user.twitterUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to submit idea");
        return;
      }

      toast.success(
        "Idea submitted successfully! AI is reviewing your submission..."
      );
      router.push("/marketplace");
    } catch (error) {
      console.error("Submit idea error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create New Idea
          </h1>
          <p className="text-muted-foreground">
            Submit your idea for AI verification and NFT minting
          </p>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                  Connect Your Wallet
                </h3>
                <p className="text-sm text-yellow-700">
                  You need to connect your wallet before submitting an idea.
                </p>
              </div>
              <ConnectButton />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info Section */}
          <div className="bg-white border border-lightgray rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Basic Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Idea Title"
                {...register("title")}
                error={errors.title?.message}
                placeholder="Enter a compelling title for your idea"
              />

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Idea Image
                </label>
                {!imagePreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploadingImage}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        isUploadingImage
                          ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                          : "border-lightgray hover:border-tan hover:bg-lightgray/50"
                      }`}
                    >
                      <Upload
                        className={`h-10 w-10 mb-2 ${
                          isUploadingImage
                            ? "text-gray-400"
                            : "text-muted-foreground"
                        }`}
                      />
                      <p className="text-sm text-muted-foreground mb-1">
                        {isUploadingImage
                          ? "Uploading..."
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-full h-48 rounded-lg overflow-hidden border border-lightgray">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {errors.image && (
                  <p className="mt-1.5 text-sm text-destructive">
                    {errors.image.message}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Upload an image that represents your idea (max 10MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Categories (Select 1-3)
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        disabled={!isSelected && selectedCategories.length >= 3}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-tan text-white"
                            : selectedCategories.length >= 3
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-lightgray text-foreground hover:bg-gray-200"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                {errors.categories && (
                  <p className="mt-1.5 text-sm text-destructive">
                    {errors.categories.message}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {selectedCategories.length} / 3 categories selected
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Automatic Pricing:</span> Your
                  idea's price will be automatically calculated based on AI
                  analysis scores. Prices range from $2 to $10 based on
                  originality and use case value.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Preferred Payment Chain
                </label>
                <select
                  {...register("preferredChain")}
                  className="h-10 w-full px-3 rounded-md border border-lightgray bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tan focus-visible:ring-offset-2"
                >
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                  <option value="optimism">Optimism</option>
                  <option value="sepolia">Sepolia (Testnet)</option>
                </select>
                {errors.preferredChain && (
                  <p className="mt-1.5 text-sm text-destructive">
                    {errors.preferredChain.message}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Select the blockchain network where you want to receive
                  payments
                </p>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white border border-lightgray rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Preview/Summary
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                Preview Text (Up to 150 words)
              </label>
              <textarea
                {...register("preview")}
                rows={6}
                className="w-full rounded-md border border-lightgray bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tan focus-visible:ring-offset-2"
                placeholder="This is what buyers see before purchasing. Maximum 150 words."
              />
              <div className="flex items-center justify-between mt-2">
                {errors.preview && (
                  <p className="text-sm text-destructive">
                    {errors.preview.message}
                  </p>
                )}
                <p
                  className={`text-sm ml-auto ${
                    previewWordCount > 150
                      ? "text-destructive"
                      : "text-green-600"
                  }`}
                >
                  {previewWordCount} / 150 words
                </p>
              </div>
            </div>
          </div>

          {/* Full Content Section */}
          <div className="bg-white border border-lightgray rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Full Idea Details
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                Full Content (Up to 3000 words)
              </label>
              <textarea
                {...register("fullContent")}
                rows={20}
                className="w-full rounded-md border border-lightgray bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tan focus-visible:ring-offset-2"
                placeholder="This is revealed after purchase. Provide detailed information about your idea. Maximum 3000 words."
              />
              <div className="flex items-center justify-between mt-2">
                {errors.fullContent && (
                  <p className="text-sm text-destructive">
                    {errors.fullContent.message}
                  </p>
                )}
                <p
                  className={`text-sm ml-auto ${
                    fullContentWordCount > 3000
                      ? "text-destructive"
                      : "text-green-600"
                  }`}
                >
                  {fullContentWordCount} / 3000 words
                </p>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-lightgray rounded-lg p-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Note:</span> Your idea will be
              analyzed by AI and minted as an NFT after verification. Make sure
              your preview accurately represents your full content.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-lightgray"
              onClick={() => setShowPreviewModal(true)}
              disabled={!title || !preview}
            >
              Preview Idea
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-tan hover:bg-tan/90 text-white"
              disabled={!isConnected || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit for AI Review"}
            </Button>
          </div>
        </form>
      </main>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Idea Preview"
      >
        <div className="space-y-4">
          {image && (
            <div className="w-full h-48 bg-lightgray rounded-lg overflow-hidden">
              <img
                src={image}
                alt={title || "Idea preview"}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <CategoryBadge key={cat} category={cat} />
            ))}
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            {title || "Idea Title"}
          </h3>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <p className="text-sm text-foreground whitespace-pre-line">
              {preview || "Preview text will appear here"}
            </p>
          </div>
          <div className="pt-4 border-t border-lightgray">
            <p className="text-sm text-muted-foreground">
              Price will be calculated after AI analysis
            </p>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
