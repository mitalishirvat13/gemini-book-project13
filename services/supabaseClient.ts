import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'supabase_url';
const SUPABASE_ANON_KEY_KEY = 'supabase_anon_key';

let supabase: SupabaseClient | null = null;
let initializationError: string | null = null;

// Try to initialize from localStorage on module load.
try {
    const supabaseUrl = localStorage.getItem(SUPABASE_URL_KEY);
    const supabaseAnonKey = localStorage.getItem(SUPABASE_ANON_KEY_KEY);

    if (supabaseUrl && supabaseAnonKey) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } else {
        initializationError = "Supabase credentials are not configured. Please provide them to connect.";
    }
} catch (error) {
    if (error instanceof Error) {
        initializationError = `Failed to initialize Supabase client from localStorage: ${error.message}`;
    } else {
        initializationError = "An unknown error occurred during Supabase client initialization.";
    }
}

/**
 * Initializes the Supabase client with the provided credentials and stores them.
 * @param url The Supabase project URL.
 * @param anonKey The Supabase anon key.
 */
export const initializeAndConnectSupabase = (url: string, anonKey: string): void => {
    try {
        // Basic validation
        if (!url || !anonKey) {
            throw new Error('Supabase URL and Anon Key cannot be empty.');
        }
        new URL(url); // This will throw if the URL is invalid

        supabase = createClient(url, anonKey);
        localStorage.setItem(SUPABASE_URL_KEY, url);
        localStorage.setItem(SUPABASE_ANON_KEY_KEY, anonKey);
        initializationError = null; // Clear any previous error
    } catch (error) {
        supabase = null;
        localStorage.removeItem(SUPABASE_URL_KEY);
        localStorage.removeItem(SUPABASE_ANON_KEY_KEY);
        if (error instanceof Error) {
            initializationError = `Failed to initialize Supabase client: ${error.message}`;
        } else {
            initializationError = "An unknown error occurred during Supabase client initialization.";
        }
        // Re-throw to be caught by the calling function in the component
        throw new Error(initializationError);
    }
};

/**
 * Retrieves the singleton Supabase client instance.
 * Throws an error if the client has not been initialized correctly.
 * @returns The Supabase client instance.
 */
export const getSupabaseClient = (): SupabaseClient => {
    if (initializationError) {
        throw new Error(initializationError);
    }
    if (!supabase) {
        // This case should theoretically not be reached if initializationError is null, but it's a good safeguard.
        throw new Error("Supabase client is not available. Please configure your credentials.");
    }
    return supabase;
};

/**
 * Returns any error that occurred during the initial client setup.
 * @returns A string containing the error message, or null if initialization was successful.
 */
export const getInitializationError = (): string | null => {
    return initializationError;
};
