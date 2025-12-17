// "use client";

// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { ExternalLink, Plus, Download, Edit2, Save, X, Upload } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { Header } from "@/components/Header";
// import { Footer } from "@/components/Footer";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { CategoryBadge } from "@/components/CategoryBadge";
// import { RatingDisplay } from "@/components/RatingDisplay";
// import { dummyIdeas } from "@/lib/dummyData";
// import { Idea, IdeaStatus, User } from "@/lib/types";

// const profileSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   email: z.string().email("Invalid email address"),
//   twitterUrl: z
//     .string()
//     .url("Invalid URL")
//     .refine(
//       (url) => url.includes("twitter.com") || url.includes("x.com"),
//       "URL must be from twitter.com or x.com"
//     ),
// });

// type ProfileFormData = z.infer<typeof profileSchema>;

// export default function ProfilePage() {
//   const [isEditing, setIsEditing] = useState(false);
//   const [user, setUser] = useState<User | null>(null);
//   const [expandedIdeas, setExpandedIdeas] = useState<Set<string>>(new Set());
//   const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
//   const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
//   const [isUploadingPicture, setIsUploadingPicture] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const router = useRouter();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<ProfileFormData>({
//     resolver: zodResolver(profileSchema),
//   });

//   useEffect(() => {
//     // Get user from localStorage
//     const userStr = localStorage.getItem("user");
//     if (!userStr) {
//       router.push("/login");
//       return;
//     }

//     const userData = JSON.parse(userStr) as User;
//     setUser(userData);
//     reset({
//       name: userData.name,
//       email: userData.email,
//       twitterUrl: userData.twitterUrl,
//     });
//     if (userData.profilePicture) {
//       setProfilePicturePreview(userData.profilePicture);
//     }
//   }, [router, reset]);

//   const toggleExpand = (id: string) => {
//     const newExpanded = new Set(expandedIdeas);
//     if (newExpanded.has(id)) {
//       newExpanded.delete(id);
//     } else {
//       newExpanded.add(id);
//     }
//     setExpandedIdeas(newExpanded);
//   };

//   const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       toast.error('Please select an image file');
//       return;
//     }

//     const maxSize = 5 * 1024 * 1024; // 5MB
//     if (file.size > maxSize) {
//       toast.error('Image size must be less than 5MB');
//       return;
//     }

//     setProfilePictureFile(file);

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setProfilePicturePreview(reader.result as string);
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeProfilePicture = () => {
//     setProfilePictureFile(null);
//     setProfilePicturePreview(null);
//   };

//   const onSave = async (data: ProfileFormData) => {
//     setIsSaving(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Please sign in first");
//         router.push("/login");
//         return;
//       }

//       // Upload profile picture if changed
//       let profilePicture = user?.profilePicture || "";
//       if (profilePictureFile) {
//         setIsUploadingPicture(true);
//         try {
//           const formData = new FormData();
//           formData.append('file', profilePictureFile);

//           const uploadResponse = await fetch('/api/upload/profile-picture', {
//             method: 'POST',
//             body: formData,
//           });

//           if (uploadResponse.ok) {
//             const uploadResult = await uploadResponse.json();
//             profilePicture = uploadResult.url;
//           }
//         } catch (error) {
//           console.error('Profile picture upload error:', error);
//         } finally {
//           setIsUploadingPicture(false);
//         }
//       }

//       // Update profile
//       const response = await fetch("/api/profile/update", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           ...data,
//           profilePicture,
//         }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         toast.error(result.error || "Failed to update profile");
//         return;
//       }

//       // Update localStorage
//       localStorage.setItem("user", JSON.stringify(result.user));
//       setUser(result.user);
//       setIsEditing(false);
//       toast.success("Profile updated successfully!");
//     } catch (error) {
//       console.error("Update profile error:", error);
//       toast.error("An error occurred. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const onCancel = () => {
//     if (user) {
//       reset({
//         name: user.name,
//         email: user.email,
//         twitterUrl: user.twitterUrl,
//       });
//       setProfilePictureFile(null);
//       if (user.profilePicture) {
//         setProfilePicturePreview(user.profilePicture);
//       } else {
//         setProfilePicturePreview(null);
//       }
//     }
//     setIsEditing(false);
//   };

//   // Mock data for ideas (replace with API call later)
//   const myIdeas = dummyIdeas.slice(0, 5).map((idea, index) => ({
//     ...idea,
//     status: (index === 0
//       ? "pending"
//       : index === 1
//       ? "rejected"
//       : "live") as IdeaStatus,
//   }));

//   const purchasedIdeas = dummyIdeas.slice(-3);

//   const stats = {
//     totalIdeasListed: myIdeas.length,
//     totalSales: myIdeas.reduce((sum, idea) => sum + idea.salesCount, 0),
//     totalRevenue: myIdeas.reduce(
//       (sum, idea) => sum + idea.price * idea.salesCount,
//       0
//     ),
//     ideasPurchased: purchasedIdeas.length,
//   };

//   const getStatusBadge = (status: IdeaStatus) => {
//     const styles = {
//       live: "bg-tan text-white",
//       pending: "bg-lightgray text-foreground",
//       rejected: "bg-destructive text-white",
//     };

//     return (
//       <span
//         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
//       >
//         {status === "live"
//           ? "Live"
//           : status === "pending"
//           ? "Under AI Review"
//           : "Rejected"}
//       </span>
//     );
//   };

//   if (!user) {
//     return null; // Or show loading spinner
//   }

//   return (
//     <div className="min-h-screen bg-white flex flex-col">
//       <Header />

//       <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Profile Stats Card */}
//         <div className="bg-white border border-lightgray rounded-lg p-6 mb-8">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
//             <div className="flex items-center gap-4">
//               {isEditing ? (
//                 <div className="relative">
//                   {profilePicturePreview ? (
//                     <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-lightgray">
//                       <img
//                         src={profilePicturePreview}
//                         alt="Profile"
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   ) : (
//                     <div className="w-16 h-16 rounded-full bg-lightgray flex items-center justify-center">
//                       <span className="text-2xl font-semibold text-foreground">
//                         {user.name[0]}
//                       </span>
//                     </div>
//                   )}
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleProfilePictureChange}
//                     className="hidden"
//                     id="profile-picture-edit"
//                   />
//                   <label
//                     htmlFor="profile-picture-edit"
//                     className="absolute bottom-0 right-0 bg-tan text-white rounded-full p-1.5 cursor-pointer hover:bg-tan/90"
//                   >
//                     <Upload className="h-3 w-3" />
//                   </label>
//                   {profilePicturePreview && (
//                     <button
//                       type="button"
//                       onClick={removeProfilePicture}
//                       className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                     >
//                       <X className="h-3 w-3" />
//                     </button>
//                   )}
//                 </div>
//               ) : (
//                 <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-lightgray">
//                   {user.profilePicture ? (
//                     <img
//                       src={user.profilePicture}
//                       alt={user.name}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full bg-lightgray flex items-center justify-center">
//                       <span className="text-2xl font-semibold text-foreground">
//                         {user.name[0]}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               )}
//               <div className="flex-1">
//                 {isEditing ? (
//                   <form onSubmit={handleSubmit(onSave)} className="space-y-3">
//                     <Input
//                       label="Name"
//                       {...register("name")}
//                       error={errors.name?.message}
//                     />
//                     <Input
//                       label="Email"
//                       type="email"
//                       {...register("email")}
//                       error={errors.email?.message}
//                     />
//                     <Input
//                       label="Twitter URL"
//                       type="url"
//                       {...register("twitterUrl")}
//                       error={errors.twitterUrl?.message}
//                     />
//                     <div className="flex gap-2">
//                       <Button
//                         type="submit"
//                         className="bg-tan hover:bg-tan/90 text-white"
//                         disabled={isSaving || isUploadingPicture}
//                       >
//                         <Save className="h-4 w-4 mr-2" />
//                         {isSaving ? "Saving..." : "Save"}
//                       </Button>
//                       <Button
//                         type="button"
//                         variant="outline"
//                         onClick={onCancel}
//                         disabled={isSaving}
//                       >
//                         Cancel
//                       </Button>
//                     </div>
//                   </form>
//                 ) : (
//                   <>
//                     <div className="flex items-center gap-2">
//                       <h2 className="text-2xl font-bold text-foreground">
//                         {user.name}
//                       </h2>
//                       <button
//                         onClick={() => setIsEditing(true)}
//                         className="text-muted-foreground hover:text-foreground"
//                       >
//                         <Edit2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                     <p className="text-sm text-muted-foreground">{user.email}</p>
//                     <a
//                       href={user.twitterUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-sm text-tan hover:text-tan/80 flex items-center gap-1 mt-1"
//                     >
//                       <ExternalLink className="h-4 w-4" />
//                       Twitter Profile
//                     </a>
//                   </>
//                 )}
//               </div>
//             </div>
//             {!isEditing && (
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div>
//                   <p className="text-2xl font-bold text-tan">
//                     {stats.totalIdeasListed}
//                   </p>
//                   <p className="text-sm text-muted-foreground">Ideas Listed</p>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-tan">
//                     ${stats.totalRevenue}
//                   </p>
//                   <p className="text-sm text-muted-foreground">Total Sales</p>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-tan">
//                     {stats.totalSales}
//                   </p>
//                   <p className="text-sm text-muted-foreground">Units Sold</p>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-tan">
//                     {stats.ideasPurchased}
//                   </p>
//                   <p className="text-sm text-muted-foreground">Ideas Purchased</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Tabs */}
//         <Tabs defaultValue="my-ideas" className="w-full">
//           <TabsList className="grid w-full grid-cols-2 mb-6">
//             <TabsTrigger value="my-ideas">My Ideas</TabsTrigger>
//             <TabsTrigger value="purchased">Purchased Ideas</TabsTrigger>
//           </TabsList>

//           {/* My Ideas Tab */}
//           <TabsContent value="my-ideas" className="space-y-4">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-semibold text-foreground">
//                 My Created Ideas
//               </h3>
//               <Link href="/create-idea">
//                 <Button className="bg-tan hover:bg-tan/90 text-white">
//                   <Plus className="h-4 w-4 mr-2" />
//                   Create New Idea
//                 </Button>
//               </Link>
//             </div>

//             {myIdeas.length > 0 ? (
//               <div className="space-y-4">
//                 {myIdeas.map((idea) => (
//                   <div
//                     key={idea.id}
//                     className="bg-white border border-lightgray rounded-lg p-6"
//                   >
//                     <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-3">
//                           <div className="flex flex-wrap gap-2">
//                             {idea.categories.map((cat) => (
//                               <CategoryBadge key={cat} category={cat} />
//                             ))}
//                           </div>
//                           {getStatusBadge(idea.status)}
//                         </div>
//                         <h4 className="text-lg font-semibold text-foreground mb-2">
//                           {idea.title}
//                         </h4>
//                         <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
//                           {idea.preview}
//                         </p>
//                         <div className="flex items-center gap-6 text-sm">
//                           <div>
//                             <span className="text-muted-foreground">
//                               Price:{" "}
//                             </span>
//                             <span className="font-semibold text-foreground">
//                               ${idea.price}
//                             </span>
//                           </div>
//                           <div>
//                             <span className="text-muted-foreground">
//                               Sales:{" "}
//                             </span>
//                             <span className="font-semibold text-foreground">
//                               {idea.salesCount}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="flex flex-col gap-2">
//                         <Link href={`/idea/${idea.id}`}>
//                           <Button variant="outline" className="w-full">
//                             View Details
//                           </Button>
//                         </Link>
//                         {idea.status === "live" && (
//                           <Button variant="outline" className="w-full">
//                             <Download className="h-4 w-4 mr-2" />
//                             Download Analytics
//                           </Button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <p className="text-lg text-muted-foreground mb-4">
//                   You haven't created any ideas yet
//                 </p>
//                 <Link href="/create-idea">
//                   <Button className="bg-tan hover:bg-tan/90 text-white">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Create Your First Idea
//                   </Button>
//                 </Link>
//               </div>
//             )}
//           </TabsContent>

//           {/* Purchased Ideas Tab */}
//           <TabsContent value="purchased" className="space-y-4">
//             <h3 className="text-xl font-semibold text-foreground mb-4">
//               Purchased Ideas
//             </h3>

//             {purchasedIdeas.length > 0 ? (
//               <div className="space-y-4">
//                 {purchasedIdeas.map((idea) => (
//                   <div
//                     key={idea.id}
//                     className="bg-white border border-lightgray rounded-lg p-6"
//                   >
//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-3">
//                           <div className="flex flex-wrap gap-2">
//                             {idea.categories.map((cat) => (
//                               <CategoryBadge key={cat} category={cat} />
//                             ))}
//                           </div>
//                         </div>
//                         <h4 className="text-lg font-semibold text-foreground mb-2">
//                           {idea.title}
//                         </h4>
//                         <p className="text-sm text-muted-foreground mb-4">
//                           {idea.preview}
//                         </p>
//                       </div>
//                     </div>

//                     {expandedIdeas.has(idea.id) ? (
//                       <div className="space-y-4">
//                         <div className="pt-4 border-t border-lightgray">
//                           <h5 className="font-semibold text-foreground mb-2">
//                             Full Content:
//                           </h5>
//                           <p className="text-sm text-foreground whitespace-pre-line">
//                             {idea.fullContent}
//                           </p>
//                         </div>
//                         <div className="grid grid-cols-3 gap-4 pt-4 border-t border-lightgray">
//                           <RatingDisplay
//                             label="Originality"
//                             value={idea.aiRating.originality}
//                           />
//                           <RatingDisplay
//                             label="Use Case Value"
//                             value={idea.aiRating.useCaseValue}
//                           />
//                           <RatingDisplay
//                             label="Category Match"
//                             value={idea.aiRating.categoryMatch}
//                           />
//                         </div>
//                         <Button
//                           variant="outline"
//                           onClick={() => toggleExpand(idea.id)}
//                           className="w-full"
//                         >
//                           Show Less
//                         </Button>
//                       </div>
//                     ) : (
//                       <Button
//                         variant="outline"
//                         onClick={() => toggleExpand(idea.id)}
//                         className="w-full"
//                       >
//                         View Full Content
//                       </Button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <p className="text-lg text-muted-foreground">
//                   You haven't purchased any ideas yet
//                 </p>
//               </div>
//             )}
//           </TabsContent>
//         </Tabs>
//       </main>

//       <Footer />
//     </div>
//   );
// }


import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page