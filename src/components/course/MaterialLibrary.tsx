
import { Book, FileText, Trash2, Zap, Brain, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Material } from "@/types/database";

interface MaterialLibraryProps {
  materials: Material[] | undefined;
  isLoadingMaterials: boolean;
  isGenerating: boolean;
  selectedMaterialId: string | null;
  onGenerateFromMaterial: (materialId: string) => void;
  onRefetchMaterials: () => void;
}

export const MaterialLibrary = ({
  materials,
  isLoadingMaterials,
  isGenerating,
  selectedMaterialId,
  onGenerateFromMaterial,
  onRefetchMaterials
}: MaterialLibraryProps) => {
  const { user } = useAuth();

  const handleDeleteMaterial = async (materialId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success("Material deleted successfully");
      onRefetchMaterials();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete material");
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
            <p className="text-gray-600">Please sign in to view your materials</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingMaterials) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Book className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Materials Yet</h3>
            <p className="text-gray-600 mb-4">Upload your first course material to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5 text-blue-600" />
          My Materials Library
        </CardTitle>
        <CardDescription>
          Manage your uploaded course materials and generate study tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold line-clamp-2 flex-1">{material.title}</h3>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      <FileText className="h-3 w-3 mr-1" />
                      Doc
                    </Badge>
                  </div>
                  {material.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>
                  )}
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    {new Date(material.uploaded_at).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => onGenerateFromMaterial(material.id)}
                      disabled={isGenerating}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating && selectedMaterialId === material.id ? (
                        <>
                          <Brain className="h-3 w-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3 mr-1" />
                          Study Tools
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
