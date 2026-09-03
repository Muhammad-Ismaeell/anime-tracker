
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
    useProfile,
    useUpdateProfile,
} from "../hooks/useProfile";

import { getMediaUrl } from "../utils/mediaUrl";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";

import "../index.css";


function EditProfileForm({ user, profile }) {
    const updateProfile = useUpdateProfile();
    const navigate = useNavigate();

    const [username, setUsername] = useState(
        user?.username || ""
    );

    const [bio, setBio] = useState(
        profile?.bio || ""
    );

    const [genre, setGenre] = useState(
        profile?.favorite_genre || ""
    );

    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (!avatar) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setAvatarPreview(reader.result);
        };

        reader.readAsDataURL(avatar);

        return () => {
            reader.abort();
        };
    }, [avatar]);


    const handleSubmit = () => {
        const cleanUsername = username.trim();

        if (!cleanUsername) {
            toast.error(
                "Username cannot be empty."
            );

            return;
        }

        const formData = new FormData();

        formData.append(
            "username",
            cleanUsername
        );

        formData.append(
            "bio",
            bio
        );

        formData.append(
            "favorite_genre",
            genre
        );

        if (avatar) {
            formData.append(
                "avatar",
                avatar
            );
        }

        updateProfile.mutate(
            formData,
            {
                onSuccess: () => {
                    navigate("/profile");
                },
            }
        );
    };


    return (
        <div className="edit-profile-page fade-in">
            <div className="edit-profile-card">

                <div className="edit-profile-header">

                    <div className="avatar-preview-wrapper">

                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="avatar-preview"
                            />
                        ) : profile?.avatar ? (
                            <img
                                src={getMediaUrl(profile.avatar)}
                                alt="Current profile avatar"
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
                                🎭{" "}
                                {genre ||
                                    "No genre selected"}
                            </div>

                            <div className="profile-chip">
                                ✍️ {bio.length} Characters
                            </div>

                        </div>

                    </div>

                </div>


                <div className="edit-profile-form">

                    <div className="form-group">

                        <label htmlFor="profile-username">
                            Username
                        </label>

                        <input
                            id="profile-username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(
                                    event.target.value
                                )
                            }
                            placeholder="Choose a username"
                            className="profile-input"
                            maxLength={150}
                        />

                    </div>


                    <div className="form-group">

                        <label htmlFor="profile-bio">
                            Bio
                        </label>

                        <textarea
                            id="profile-bio"
                            rows={5}
                            value={bio}
                            onChange={(event) =>
                                setBio(
                                    event.target.value
                                )
                            }
                            placeholder="Tell people about yourself..."
                            className="profile-textarea"
                        />

                    </div>


                    <div className="form-group">

                        <label htmlFor="profile-genre">
                            Favorite Genre
                        </label>

                        <input
                            id="profile-genre"
                            type="text"
                            value={genre}
                            onChange={(event) =>
                                setGenre(
                                    event.target.value
                                )
                            }
                            placeholder="Action, Romance, Fantasy..."
                            className="profile-input"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Profile Picture
                        </label>

                        <label className="upload-box">

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                    const file =
                                        event.target.files?.[0] || null;

                                    setAvatar(file);
                                    setAvatarPreview(null);
                                }}
                                hidden
                            />

                            <span>
                                📸 Upload Avatar
                            </span>

                        </label>

                    </div>


                    <button
                        type="button"
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
    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useProfile();


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
                {Array.from({
                    length: 8,
                }).map((_, index) => (
                    <AnimeCardSkeleton
                        key={index}
                    />
                ))}
            </div>
        );
    }


    if (isError) {
        return (
            <div className="profile-error">

                <h2>
                    Failed to load profile
                </h2>

                <p>
                    Something went wrong while loading your profile.
                </p>

                <button
                    type="button"
                    className="retry-btn"
                    onClick={refetch}
                >
                    Try Again
                </button>

            </div>
        );
    }


    return (
        <EditProfileForm
            key={
                data?.user?.id ??
                data?.profile?.id ??
                "profile-form"
            }
            user={data?.user}
            profile={data?.profile}
        />
    );
}


export default EditProfile;
