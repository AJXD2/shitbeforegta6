import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"
import type { PostCommentType, PostType, PostVoteType, UserType } from "$lib";
import type Post from "./components/Post.svelte";
import { addFlashMessage } from "$lib/stores/flashMessages";
const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

 

