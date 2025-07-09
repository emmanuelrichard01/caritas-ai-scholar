import { useState } from "react";
import { HistoryCard } from "./HistoryCard";
import { HistoryDetailModal } from "./HistoryDetailModal";

interface HistoryItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface HistoryListProps {
  history: HistoryItem[];
  onDeleteItem: (id: string) => void;
  isDeleting: boolean;
}

export const HistoryList = ({ history, onDeleteItem, isDeleting }: HistoryListProps) => {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (item: HistoryItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <div className="space-y-3 sm:space-y-4 lg:space-y-5">
        {history.map((item) => (
          <HistoryCard
            key={item.id}
            item={item}
            isDeleting={isDeleting}
            onDelete={onDeleteItem}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      <HistoryDetailModal
        item={selectedItem}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};