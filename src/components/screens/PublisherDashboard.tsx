import React, { useState } from 'react';
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, DollarSign, BookOpen, ArrowUpRight, Star, Calendar, Upload, Plus } from "lucide-react";
import { EmptyState } from "../EmptyState";
import { MobileScreenWrapper } from "../MobileScreenWrapper";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

const PublisherDashboard = ({ darkMode }: { darkMode: boolean }) => {
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Mock Data
    const stats = [
        { label: "Total Reads", value: "12.5K", change: "+12%", icon: BookOpen, color: "text-blue-600" },
        { label: "Revenue", value: "$4,250", change: "+8%", icon: DollarSign, color: "text-green-600" },
        { label: "Active Readers", value: "3.2K", change: "+15%", icon: Users, color: "text-purple-600" },
        { label: "Avg Rating", value: "4.8", change: "+2%", icon: Star, color: "text-amber-600" },
    ];

    const salesData = [
        { name: 'Jan', revenue: 4000, reads: 2400 },
        { name: 'Feb', revenue: 3000, reads: 1398 },
        { name: 'Mar', revenue: 2000, reads: 9800 },
        { name: 'Apr', revenue: 2780, reads: 3908 },
        { name: 'May', revenue: 1890, reads: 4800 },
        { name: 'Jun', revenue: 2390, reads: 3800 },
        { name: 'Jul', revenue: 3490, reads: 4300 },
    ];

    const topBooks = [
        { id: 1, title: "The Art of Code", reads: "2.4K", revenue: "$1.2K", rating: 4.9 },
        { id: 2, title: "Digital Minimalism", reads: "1.8K", revenue: "$900", rating: 4.7 },
        { id: 3, title: "Future AI", reads: "1.2K", revenue: "$600", rating: 4.8 },
    ];

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        // Simulate upload delay
        setTimeout(() => {
            setIsUploading(false);
            setShowUploadDialog(false);
            toast.success("Book uploaded successfully!", {
                description: "Your book is now under review."
            });
        }, 2000);
    };

    return (
        <MobileScreenWrapper title="Publisher Dashboard">
            <div className={`min-h-screen p-4 md:p-8 pb-24 ${darkMode ? "bg-transparent" : "bg-gray-50"}`}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                            <p className="text-gray-500 dark:text-gray-400">Welcome back, Penguin Books</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Calendar className="w-4 h-4 mr-2" />
                                Last 30 Days
                            </Button>
                            <Button onClick={() => setShowUploadDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Upload New Book
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={stat.label} className="p-4 bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                            {stat.change}
                                            <ArrowUpRight className="w-3 h-3 ml-1" />
                                        </span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {stat.label}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Charts Section */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <Card className="p-6 bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold mb-6">Revenue Trend</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold mb-6">Reads Overview</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="reads" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    {/* Top Books */}
                    <Card className="p-6 bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold mb-4">Top Performing Books</h3>
                        {topBooks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-800">
                                            <th className="text-left py-3 text-sm font-medium text-gray-500">Book Title</th>
                                            <th className="text-left py-3 text-sm font-medium text-gray-500">Reads</th>
                                            <th className="text-left py-3 text-sm font-medium text-gray-500">Revenue</th>
                                            <th className="text-left py-3 text-sm font-medium text-gray-500">Rating</th>
                                            <th className="text-right py-3 text-sm font-medium text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topBooks.map((book) => (
                                            <tr key={book.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                                                <td className="py-4 text-sm font-medium text-gray-900 dark:text-white">{book.title}</td>
                                                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{book.reads}</td>
                                                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{book.revenue}</td>
                                                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-1" />
                                                        {book.rating}
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <Button variant="ghost" size="sm">View Details</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState
                                icon={Upload}
                                title="No Books Published"
                                description="You haven't published any books yet. Start your journey by uploading your first book."
                                actionLabel="Upload New Book"
                                onAction={() => setShowUploadDialog(true)}
                            />
                        )}
                    </Card>
                </div>
            </div>

            {/* Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Upload New Book</DialogTitle>
                        <DialogDescription>
                            Fill in the details to publish your book to LibraGO.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Book Title</Label>
                            <Input id="title" placeholder="Enter book title" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="author">Author</Label>
                            <Input id="author" placeholder="Enter author name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" placeholder="Enter book description" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input id="price" type="number" placeholder="0.00" min="0" step="0.01" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="file">Book File (PDF/EPUB)</Label>
                            <Input id="file" type="file" accept=".pdf,.epub" required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUploading}>
                                {isUploading ? (
                                    <>
                                        <Upload className="w-4 h-4 mr-2 animate-bounce" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Publish Book
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MobileScreenWrapper>
    );
};

export default PublisherDashboard;
