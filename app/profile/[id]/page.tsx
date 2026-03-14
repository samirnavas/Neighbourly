import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (!profile) {
        notFound();
    }

    // Fetch reviews where reviewee_id is this profile's ID
    const { data: reviews } = await supabase
        .from("reviews")
        .select(`
            id,
            rating,
            comment,
            created_at,
            reviewer:profiles!reviewer_id(full_name, avatar_url)
        `)
        .eq("reviewee_id", id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-[100dvh] bg-gray-50 pb-[80px] overflow-y-auto">
            {/* Header Info */}
            <div className="bg-white px-4 py-8 shadow-sm flex flex-col items-center border-b border-gray-100 relative">
                <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-4xl font-bold overflow-hidden mb-5 border-[6px] border-white shadow-xl relative">
                    {profile.avatar_url ? (
                        <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
                    ) : (
                        profile.full_name?.charAt(0) || "U"
                    )}
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{profile.full_name || "Unknown User"}</h1>
                <p className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-widest">Public Host</p>
                
                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                    <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-4 flex flex-col items-center justify-center border border-amber-100/50 shadow-sm">
                        <div className="flex items-center text-amber-500 font-extrabold text-2xl tracking-tighter">
                            <Star className="w-6 h-6 mr-1.5 fill-current text-amber-500" />
                            {Number(profile.trust_score || 5.0).toFixed(1)}
                        </div>
                        <span className="text-xs text-amber-600/70 font-bold mt-1.5 uppercase tracking-widest">Trust Score</span>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 flex flex-col items-center justify-center border border-blue-100/50 shadow-sm">
                        <div className="flex items-center text-blue-600 font-extrabold text-2xl tracking-tighter">
                            <MessageSquare className="w-6 h-6 mr-1.5 text-blue-500" />
                            {reviews?.length || 0}
                        </div>
                        <span className="text-xs text-blue-600/70 font-bold mt-1.5 uppercase tracking-widest">Reviews</span>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="p-4 mt-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight flex items-center">
                    User Reviews
                    {reviews && reviews.length > 0 && (
                        <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">{reviews.length}</span>
                    )}
                </h2>
                
                {!reviews || reviews.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 opacity-50" />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">No reviews yet</h3>
                        <p className="text-gray-500 font-medium text-sm">When users rent from {profile.full_name?.split(' ')[0] || "this host"}, reviews will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((rev) => {
                            const reviewer = (Array.isArray(rev.reviewer) ? rev.reviewer[0] : rev.reviewer) as Record<string, unknown> | null;
                            
                            return (
                                <div key={rev.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative mr-3 shadow-sm">
                                                {reviewer?.avatar_url ? (
                                                    <Image src={String(reviewer.avatar_url)} alt="Reviewer" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">
                                                        {(reviewer?.full_name && typeof reviewer.full_name === 'string') ? reviewer.full_name.charAt(0) : "?"}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm leading-none">{reviewer?.full_name ? String(reviewer.full_name) : "Anonymous User"}</span>
                                                <span className="text-xs text-gray-400 mt-1 font-semibold">
                                                    {new Date(rev.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex bg-amber-50 px-2 py-1 rounded-md border border-amber-100 text-amber-400 shrink-0">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-700 text-[15px] font-medium leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                        &quot;{rev.comment}&quot;
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
