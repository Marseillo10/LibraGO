import React, { useState } from "react";
import { Download, Trash2, Pause, Play, CheckCircle, AlertCircle, HardDrive } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { useBooks } from "../../context/BooksContext";

const DownloadScreen = () => {
  const { downloads, pauseDownload, resumeDownload, cancelDownload, removeDownload } = useBooks();
  const [autoDownload, setAutoDownload] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [downloadQuality, setDownloadQuality] = useState("medium");

  const storageInfo = {
    used: downloads.reduce((acc, d) => acc + parseFloat(d.downloadedSize), 0) / 1024, // GB approximation
    total: 10,
    unit: "GB",
  };

  const usedPercentage = (storageInfo.used / storageInfo.total) * 100;

  const handlePauseResume = (id: string, status: string) => {
    if (status === "downloading") {
      pauseDownload(id);
    } else {
      resumeDownload(id);
    }
  };

  const handleRetry = (id: string) => {
    resumeDownload(id); // Retry logic same as resume for now
  };

  const handleDelete = (id: string) => {
    removeDownload(id);
  };

  const handleClearCompleted = () => {
    downloads.filter(d => d.status === "completed").forEach(d => removeDownload(d.id));
    toast.success("Download selesai telah dihapus");
  };

  const handleClearAll = () => {
    downloads.forEach(d => removeDownload(d.id));
    toast.success("Semua download dihapus");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "downloading":
        return <Download className="w-5 h-5 text-blue-600 animate-pulse" />;
      case "paused":
        return <Pause className="w-5 h-5 text-orange-600" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const activeDownloads = downloads.filter(d => d.status === "downloading" || d.status === "paused");
  const completedDownloads = downloads.filter(d => d.status === "completed");
  const errorDownloads = downloads.filter(d => d.status === "failed");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white">Download</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kelola download untuk offline reading
              </p>
            </div>
          </div>

          {downloads.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Semua
            </Button>
          )}
        </div>

        {/* Storage Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-gray-900 dark:text-white">Storage</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Digunakan</span>
              <span className="text-gray-900 dark:text-white">
                {storageInfo.used.toFixed(2)} {storageInfo.unit} dari {storageInfo.total} {storageInfo.unit}
              </span>
            </div>
            <Progress value={usedPercentage} className="h-2" />
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {completedDownloads.length} buku telah didownload
            </p>
          </div>
        </Card>

        {/* Download Settings */}
        <Card className="p-6 mb-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Pengaturan Download</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-download">Auto Download</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download otomatis buku yang sedang dibaca
                </p>
              </div>
              <Switch
                id="auto-download"
                checked={autoDownload}
                onCheckedChange={setAutoDownload}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="wifi-only">WiFi Only</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hanya download saat terhubung WiFi
                </p>
              </div>
              <Switch
                id="wifi-only"
                checked={wifiOnly}
                onCheckedChange={setWifiOnly}
              />
            </div>

            <div>
              <Label>Kualitas Download</Label>
              <Select value={downloadQuality} onValueChange={setDownloadQuality}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Hemat Kuota)</SelectItem>
                  <SelectItem value="medium">Medium (Rekomendasi)</SelectItem>
                  <SelectItem value="high">High (Kualitas Terbaik)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Downloads List */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-4">
              <TabsTrigger value="all" className="flex-shrink-0">
                Semua ({downloads.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-shrink-0">
                Aktif ({activeDownloads.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-shrink-0">
                Selesai ({completedDownloads.length})
              </TabsTrigger>
              <TabsTrigger value="error" className="flex-shrink-0">
                Error ({errorDownloads.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            {downloads.length === 0 ? (
              <Card className="p-12 text-center">
                <Download className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-gray-900 dark:text-white mb-2">
                  Belum Ada Download
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Download buku untuk dibaca secara offline
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {downloads.map((download) => (
                  <Card key={download.id} className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                        {download.coverUrl ? (
                          <img src={download.coverUrl} alt={download.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
                            No Cover
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-gray-900 dark:text-white mb-1 truncate">
                              {download.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {download.author}
                            </p>
                          </div>
                          {getStatusIcon(download.status)}
                        </div>

                        <div className="space-y-2">
                          {download.status !== "completed" && (
                            <>
                              <Progress value={download.progress} className="h-2" />
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                                <span>{download.progress}%</span>
                                <span>{download.downloadedSize} / {download.size}</span>
                              </div>
                            </>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              {download.quality} quality
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {download.size}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {download.status === "downloading" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePauseResume(download.id, download.status)}
                            >
                              <Pause className="w-4 h-4 mr-1" />
                              Jeda
                            </Button>
                          )}
                          {download.status === "paused" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePauseResume(download.id, download.status)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Lanjutkan
                            </Button>
                          )}
                          {download.status === "failed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetry(download.id)}
                            >
                              Coba Lagi
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(download.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            <div className="space-y-3">
              {activeDownloads.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Tidak ada download aktif
                  </p>
                </Card>
              ) : (
                activeDownloads.map((download) => (
                  <Card key={download.id} className="p-4">
                    {/* Simplified view for active tab, can be expanded if needed */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">{download.title}</p>
                        <p className="text-sm text-gray-500">{download.progress}% - {download.status}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handlePauseResume(download.id, download.status)}>
                        {download.status === 'downloading' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-3">
              {completedDownloads.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Belum ada download selesai
                  </p>
                </Card>
              ) : (
                <>
                  <div className="flex justify-end mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCompleted}
                    >
                      Hapus Semua Selesai
                    </Button>
                  </div>
                  {completedDownloads.map((download) => (
                    <Card key={download.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden">
                          {download.coverUrl && <img src={download.coverUrl} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-medium">{download.title}</p>
                          <p className="text-sm text-gray-500">{download.size}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeDownload(download.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="error">
            <div className="space-y-3">
              {errorDownloads.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Tidak ada download yang error
                  </p>
                </Card>
              ) : (
                errorDownloads.map((download) => (
                  <Card key={download.id} className="p-4">
                    <p className="text-gray-900 dark:text-white">{download.title}</p>
                    <Button size="sm" variant="outline" onClick={() => handleRetry(download.id)}>Retry</Button>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DownloadScreen;
