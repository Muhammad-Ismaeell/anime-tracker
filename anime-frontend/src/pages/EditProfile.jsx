import { useState } from "react";

import {
    useProfile,
    useUpdateProfile
} from "../hooks/user/useProfile";
import { getMediaUrl } from "../utils/mediaUrl";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import toast from "react-hot-toast";
import "../index.css";


function EditProfileForm({ profile }) {
    const updateProfile = useUpdateProfile();

    const [bio, setBio] = useState(profile?.bio || "");
    const [genre, setGenre] = useState(profile?.favorite_genre || "");
    const [avatar, setAvatar] = useState(null);

    const handleSubmit = () => {
        const formData = new FormData();

        formData.append("bio", bio);
        formData.append("favorite_genre", genre);

        if (avatar) {
            formData.append("avatar", avatar);
        }

        updateProfile.mutate(formData, {
            onSuccess: () => {
                toast.success("Profile updated!");
            },
            onError: () => {
                toast.error("Failed to update profile.");
            },
        });
    };

    return (
        <div className="edit-profile-page fade-in">
            <div className="edit-profile-card">

                <div className="edit-profile-header">

                    <div className="avatar-preview-wrapper">
                        {avatar ? (
                            <img
                                src={URL.createObjectURL(avatar)}
                                alt="preview"
                                className="avatar-preview"
                            />
                        ) : profile?.avatar ? (
                            <img
                                src={getMediaUrl(profile.avatar)}
                                alt="avatar"
                                className="avatar-preview"
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                👤
                            </div>
                        )}
                    </div>

                    <div className="edit-profile-info">
                        <h1 className="edit-profile-title">
                            Edit Profile
                        </h1>

                        <p className="edit-profile-subtitle">
                            Customize your anime identity
                        </p>

                        <div className="profile-extra">
                            <div className="profile-chip">
                                🎭 {genre || "No genre selected"}
                            </div>

                            <div className="profile-chip">
                                ✍️ {bio.length} Characters
                            </div>
                        </div>
                    </div>

                </div>

                <div className="edit-profile-form">

                    <div className="form-group">
                        <label>Bio</label>

                        <textarea
                            rows={5}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell people about yourself..."
                            className="profile-textarea"
                        />
                    </div>

                    <div className="form-group">
                        <label>Favorite Genre</label>

                        <input
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            placeholder="Action, Romance, Fantasy..."
                            className="profile-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Profile Picture</label>

                        <label className="upload-box">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setAvatar(e.target.files?.[0] || null)
                                }
                                hidden
                            />

                            <span>
                                📸 Upload Avatar
                            </span>
                        </label>
                    </div>

                    <button
                        className="save-profile-btn"
                        onClick={handleSubmit}
                        disabled={updateProfile.isPending}
                    >
                        {updateProfile.isPending
                            ? "Saving..."
                            : "Save Profile"}
                    </button>

                </div>
            </div>
        </div>
    );
}


function EditProfile() {
    const { data, isLoading } = useProfile();

    if (isLoading) {
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 20,
                    padding: 20,
                }}
            >
                {Array.from({ length: 8 }).map((_, i) => (
                    <AnimeCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <EditProfileForm
            key={data?.profile?.id ?? "profile-form"}
            profile={data?.profile}
        />
    );
}

export default EditProfile;