"use client";

import { Button } from "@/components/ui/button";
import { LogOut, School, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";

interface CurrentUserResponse {
  username: string;
}

export default function DashboardHeader() {
    const [user, setUser] = useState<string|null>("");
    const router = useRouter();
    useEffect(() => {
        const getUser = async () => {
            try {
                const token = Cookies.get("token");
                if (!token) {
                    setUser(null);
                    return;
                }

                const response = await apiClient.get<CurrentUserResponse>('/api/auth/username');
                const userData: CurrentUserResponse = response.data;

                setUser(userData.username);
            } catch (err: any) {
                console.error("Failed to fetch current user:", err.response?.data || err.message);
                setUser(null);
            }
        };

        getUser();
    }, []);
    const handleLogout = () => {
        Cookies.remove("token");
        router.push("/login");
    };


    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <School className="h-8 w-8 text-primary" />
                        <h1 className="text-xl font-semibold text-gray-900">UDISE Dashboard</h1>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>{user|| "Loading..."}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive cursor-pointer"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}