"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    twitterUrl: z
      .string()
      .url("Invalid URL")
      .refine(
        (url) => url.includes("twitter.com") || url.includes("x.com"),
        "URL must be from twitter.com or x.com"
      ),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB for profile pictures)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setProfilePictureFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary (we'll use a temporary approach - upload after signup)
    // For now, we'll store the file and upload it during signup
  };

  const removeProfilePicture = () => {
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
    setProfilePictureUrl("");
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      // Upload profile picture first if provided
      let profilePicture = "";
      if (profilePictureFile) {
        setIsUploadingPicture(true);
        try {
          const formData = new FormData();
          formData.append('file', profilePictureFile);

          // We need to upload without auth for signup, so we'll create a separate endpoint
          // For now, let's upload it as part of signup process
          const uploadResponse = await fetch('/api/upload/profile-picture', {
            method: 'POST',
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            profilePicture = uploadResult.url;
          }
        } catch (error) {
          console.error('Profile picture upload error:', error);
          // Continue without profile picture if upload fails
        } finally {
          setIsUploadingPicture(false);
        }
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          twitterUrl: data.twitterUrl,
          password: data.password,
          profilePicture: profilePicture || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to create account");
        return;
      }

      // Store token in localStorage
      if (result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      toast.success("Account created successfully!");
      router.push("/marketplace");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create Account
            </h1>
            <p className="text-muted-foreground">
              Join Koopland to start buying and selling ideas
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Name"
              {...register("name")}
              error={errors.name?.message}
            />

            <Input
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="Twitter Account URL"
              type="url"
              placeholder="https://twitter.com/yourusername"
              {...register("twitterUrl")}
              error={errors.twitterUrl?.message}
            />

            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                Profile Picture (Optional)
              </label>
              {!profilePicturePreview ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={isUploadingPicture}
                    className="hidden"
                    id="profile-picture-upload"
                  />
                  <label
                    htmlFor="profile-picture-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isUploadingPicture
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-lightgray hover:border-tan hover:bg-lightgray/50'
                    }`}
                  >
                    <Upload className={`h-6 w-6 mb-2 ${isUploadingPicture ? 'text-gray-400' : 'text-muted-foreground'}`} />
                    <p className="text-sm text-muted-foreground">
                      {isUploadingPicture ? 'Uploading...' : 'Click to upload profile picture'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-lightgray mx-auto">
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-tan hover:bg-tan/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-tan hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
