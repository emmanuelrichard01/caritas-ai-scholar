
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { History as HistoryIcon, Clock, Search, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatHistory {
  id: string;
  title: string;
  preview: string;
  date: string;
  category: string;
}

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // This will be replaced with actual data from Supabase later
  const placeholderHistory: ChatHistory[] = [
    {
      id: "1",
      title: "Course Material Analysis",
      preview: "Last message: Analyzed chapter 3 of Business Ethics...",
      date: "2025-04-25",
      category: "Course Tutor"
    },
    {
      id: "2",
      title: "Assignment Planning",
      preview: "Last message: Created study schedule for finals...",
      date: "2025-04-24",
      category: "Study Planner"
    }
  ];

  const filteredHistory = placeholderHistory.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      
      <div className="flex-1 pl-[70px] md:pl-[260px] transition-all duration-300">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white mr-4">
              <HistoryIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold dark:text-white">Chat History</h1>
              <p className="text-muted-foreground dark:text-slate-400">View and manage your past conversations</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm border hover:border-blue-500 transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium dark:text-white">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400">{item.preview}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center text-sm text-gray-500 dark:text-slate-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {item.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-slate-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {item.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
