
import { useState } from "react";
import { GraduationCap, Upload, BookOpen, Sparkles, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useStudyMaterials } from "@/hooks/useStudyMaterials";
import { StudyToolTabs } from "@/components/studytools/StudyToolTabs";
import { MaterialUploadForm } from "@/components/course/MaterialUploadForm";
import { MaterialLibrary } from "@/components/course/MaterialLibrary";
import { StudyToolsGenerator } from "@/components/course/StudyToolsGenerator";

const CourseAssistant = () => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const { user } = useAuth();
  
  const {
    isGenerating,
    notes,
    flashcards,
    quizQuestions,
    materialContext,
    generateStudyMaterialsFromUploaded
  } = useStudyMaterials();

  // Fetch user materials with optimized query
  const { data: materials, isLoading: isLoadingMaterials, refetch: refetchMaterials } = useQuery({
    queryKey: ['materials', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching materials:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleGenerateFromMaterial = async (materialId: string, query?: string) => {
    setSelectedMaterialId(materialId);
    await generateStudyMaterialsFromUploaded(materialId, query);
    setSelectedMaterialId(null);
  };

  return (
    <PageLayout
      title="Course Assistant"
      subtitle="Upload materials and generate AI-powered study aids"
      icon={<GraduationCap className="h-6 w-6" />}
    >
      <div className="space-y-8">
        {!user && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Authentication Required</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Please sign in to access course assistant features.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Materials
            </TabsTrigger>
            <TabsTrigger value="library" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              My Library
            </TabsTrigger>
            <TabsTrigger value="tools" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Study Tools
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <MaterialUploadForm onUploadSuccess={refetchMaterials} />
          </TabsContent>
          
          <TabsContent value="library" className="space-y-4">
            <MaterialLibrary
              materials={materials}
              isLoadingMaterials={isLoadingMaterials}
              isGenerating={isGenerating}
              selectedMaterialId={selectedMaterialId}
              onGenerateFromMaterial={handleGenerateFromMaterial}
              onRefetchMaterials={refetchMaterials}
            />
          </TabsContent>
          
          <TabsContent value="tools" className="space-y-4">
            <StudyToolsGenerator
              materials={materials}
              isGenerating={isGenerating}
              selectedMaterialId={selectedMaterialId}
              onGenerateFromMaterial={handleGenerateFromMaterial}
            />
            
            {(notes || flashcards || quizQuestions) && (
              <div className="border-t pt-6 mt-6">
                <StudyToolTabs 
                  notes={notes}
                  flashcards={flashcards}
                  quizQuestions={quizQuestions}
                  materialContext={materialContext}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default CourseAssistant;
