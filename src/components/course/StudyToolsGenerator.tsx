
import { useState } from "react";
import { Book, Sparkles, Upload, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Material } from "@/types/database";

interface StudyToolsGeneratorProps {
  materials: Material[] | undefined;
  isGenerating: boolean;
  selectedMaterialId: string | null;
  onGenerateFromMaterial: (materialId: string, query?: string) => void;
}

export const StudyToolsGenerator = ({
  materials,
  isGenerating,
  selectedMaterialId,
  onGenerateFromMaterial
}: StudyToolsGeneratorProps) => {
  const [studyQuery, setStudyQuery] = useState("");
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
            <p className="text-gray-600">Please sign in to generate study tools</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Study Tools Generator
        </CardTitle>
        <CardDescription>
          Generate comprehensive study materials from your uploaded content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Study Focus (Optional)</label>
          <Input
            placeholder="e.g., Focus on key concepts, important formulas, specific chapters..."
            value={studyQuery}
            onChange={(e) => setStudyQuery(e.target.value)}
            disabled={isGenerating}
            className="focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave blank to generate comprehensive study materials covering all topics
          </p>
        </div>
        
        {materials && materials.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Select Material to Analyze</h3>
              <Badge variant="secondary" className="text-xs">
                {materials.length} material{materials.length > 1 ? 's' : ''} available
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {materials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium line-clamp-2 flex-1 text-sm">{material.title}</h4>
                        <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                          Material
                        </Badge>
                      </div>
                      
                      {material.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{material.description}</p>
                      )}
                      
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        Uploaded {new Date(material.uploaded_at).toLocaleDateString()}
                      </p>
                      
                      <Button
                        onClick={() => onGenerateFromMaterial(material.id, studyQuery)}
                        disabled={isGenerating}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-sm h-8"
                        size="sm"
                      >
                        {isGenerating && selectedMaterialId === material.id ? (
                          <>
                            <Brain className="h-3 w-3 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3 mr-2" />
                            Generate Study Tools
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {isGenerating && (
              <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 animate-spin" />
                    <div>
                      <p className="font-medium text-purple-800 dark:text-purple-200">Analyzing Your Material</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Generating comprehensive study notes, flashcards, and quiz questions...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <Book className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Materials Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload course materials first to generate AI-powered study tools
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
