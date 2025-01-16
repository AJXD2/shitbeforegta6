import type { UserType } from "$lib";
import { user } from "$lib/stores/user";
import { supabase } from "$lib/supabase";
import { writable } from "svelte/store";
import ProfileService from "$lib/services/profiles"
export const profiles = writable<UserType[]>([]);
export const userProfile = writable<UserType | null>(null);

export const fetchAllProfiles = async () => {
    const allProfiles = await ProfileService.getAll()
    profiles.set(allProfiles);
};

export const fetchProfile = async (userId: string): Promise<UserType | null> => {
    const profile = await ProfileService.get(userId);
    profiles.update((data) => {
        const existingProfileIndex = data.findIndex((v) => v.id === userId);
        if (existingProfileIndex !== -1) {
            if (profile) {
                data[existingProfileIndex] = profile;
            }
        } else if (profile) {
            data.push(profile);
        }
        return data;
    });
    return profile;
};

export const fetchProfileByusername = async (username: string): Promise<UserType | null> => {
    const profile = await ProfileService.getByUsername(username);
    profiles.update((data) => {
        const existingProfileIndex = data.findIndex((v) => v.full_name === username);
        if (existingProfileIndex !== -1) {
            if (profile) {
                data[existingProfileIndex] = profile;
            }
        } else if (profile) {
            data.push(profile);
        }
        return data;
    });
    return profile;
};

user.subscribe(async (user) => {
    if (user) {
        const profile = await fetchProfile(user.id);
        userProfile.set(profile);
    } else {
        userProfile.set(null);
    }
});

let refreshInterval: number;

export const startProfilesAutoRefresh = (interval: number) => {
    stopProfilesAutoRefresh();
    refreshInterval = window.setInterval(fetchAllProfiles, interval);
};

export const stopProfilesAutoRefresh = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
};