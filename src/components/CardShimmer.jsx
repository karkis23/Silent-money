export default function CardShimmer() {
    return (
        <div className="bg-white border border-charcoal-100 rounded-[2.5rem] p-8 space-y-6 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="w-16 h-4 bg-charcoal-100 rounded-lg"></div>
                <div className="w-10 h-10 bg-charcoal-100 rounded-xl"></div>
            </div>
            <div className="space-y-3">
                <div className="w-3/4 h-6 bg-charcoal-200 rounded-lg"></div>
                <div className="w-full h-4 bg-charcoal-100 rounded-lg"></div>
                <div className="w-2/3 h-4 bg-charcoal-100 rounded-lg"></div>
            </div>
            <div className="pt-6 border-t border-charcoal-50 flex gap-4">
                <div className="flex-1 h-12 bg-charcoal-50 rounded-xl"></div>
                <div className="flex-1 h-12 bg-charcoal-50 rounded-xl"></div>
            </div>
        </div>
    );
}
