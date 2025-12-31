import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            permissions?: {
                canApproveUsers: boolean;
                canDeleteUsers: boolean;
                canManageListings: boolean;
                canViewBookings: boolean;
                canManageSettings: boolean;
                canAccessMaintenance: boolean;
                canPermanentDelete: boolean;
            };
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: string
        permissions?: {
            canApproveUsers: boolean;
            canDeleteUsers: boolean;
            canManageListings: boolean;
            canViewBookings: boolean;
            canManageSettings: boolean;
            canAccessMaintenance: boolean;
            canPermanentDelete: boolean;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        permissions?: {
            canApproveUsers: boolean;
            canDeleteUsers: boolean;
            canManageListings: boolean;
            canViewBookings: boolean;
            canManageSettings: boolean;
            canAccessMaintenance: boolean;
            canPermanentDelete: boolean;
        };
    }
}
