import { Upload, Image, Video, LayoutGrid, Grid, List } from 'lucide-react';

export function CreativeLibraryPreview() {
    return (
        <div className="w-full bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Creative Library</h3>
                        <p className="text-white/60 text-sm sm:text-base">Verwalte und analysiere all deine Werbemittel an einem Ort</p>
                    </div>

                    <button className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 w-fit">
                        <Upload className="w-4 h-4" />
                        Creative hochladen
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="px-6 sm:px-8 py-4 border-b border-white/10">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0</div>
                        <div className="text-white/60 text-xs sm:text-sm">Total Creatives</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0</div>
                        <div className="text-white/60 text-xs sm:text-sm">Bilder</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0</div>
                        <div className="text-white/60 text-xs sm:text-sm">Videos</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0</div>
                        <div className="text-white/60 text-xs sm:text-sm">Karussells</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0.0x</div>
                        <div className="text-white/60 text-xs sm:text-sm">Ø ROAS</div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Creatives nach Name oder Tags suchen..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/20"
                            readOnly
                        />
                        <svg className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2">
                        <button className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
                            Alle
                        </button>
                        <button className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5">
                            <Image className="w-4 h-4" />
                            <span className="hidden sm:inline">Bild</span>
                        </button>
                        <button className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5">
                            <Video className="w-4 h-4" />
                            <span className="hidden sm:inline">Video</span>
                        </button>
                        <button className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5">
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden sm:inline">Karussell</span>
                        </button>
                    </div>

                    {/* Grid/List Toggle */}
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                        <button className="p-2 rounded bg-red-600 text-white">
                            <Grid className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Select Filter */}
                    <button className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="hidden sm:inline">Auswählen</span>
                    </button>
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                        <Image className="w-10 h-10 text-white/40" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">Keine Creatives vorhanden</h4>
                    <p className="text-white/40 text-sm text-center max-w-md mb-6">
                        Lade dein erstes Creative hoch oder generiere eines mit KI, um deine Library zu füllen.
                    </p>
                    <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Erstes Creative hochladen
                    </button>
                </div>
            </div>
        </div>
    );
}
