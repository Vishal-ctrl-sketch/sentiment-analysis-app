import { TranslationTool } from "@/components/translation-tool"
import { MultilingualComments } from "@/components/multilingual-comments"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TranslatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Translation Center</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Translate text and manage multilingual comments with AI-powered translation.
        </p>
      </div>

      <Tabs defaultValue="translate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="translate">Translation Tool</TabsTrigger>
          <TabsTrigger value="comments">Multilingual Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="translate" className="space-y-6">
          <TranslationTool />
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <MultilingualComments />
        </TabsContent>
      </Tabs>
    </div>
  )
}
