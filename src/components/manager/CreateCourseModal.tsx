import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Video, Plus, Trash2 } from 'lucide-react';

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  order: number;
}

export function CreateCourseModal({ open, onOpenChange }: CreateCourseModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    thumbnail: '',
    isPremium: false,
    isPublished: false
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: ''
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the data to your backend
    toast({
      title: 'Curso criado com sucesso!',
      description: `O curso "${formData.title}" foi criado e ${formData.isPublished ? 'publicado' : 'salvo como rascunho'}.`
    });
    
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      level: '',
      thumbnail: '',
      isPremium: false,
      isPublished: false
    });
    setLessons([]);
    setNewLesson({ title: '', description: '', videoUrl: '', duration: '' });
  };

  const addLesson = () => {
    if (!newLesson.title || !newLesson.videoUrl) {
      toast({
        title: 'Erro',
        description: 'Título e URL do vídeo são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    const lesson: Lesson = {
      id: Date.now().toString(),
      ...newLesson,
      order: lessons.length + 1
    };

    setLessons([...lessons, lesson]);
    setNewLesson({ title: '', description: '', videoUrl: '', duration: '' });
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Criar Nova Aula
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informações Básicas</TabsTrigger>
              <TabsTrigger value="lessons">Lições</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título do Curso *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Fundamentos do Câmbio"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cambio">Câmbio</SelectItem>
                        <SelectItem value="investimentos">Investimentos</SelectItem>
                        <SelectItem value="viagem">Viagem</SelectItem>
                        <SelectItem value="financas">Finanças</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level">Nível *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="thumbnail">URL da Thumbnail</Label>
                    <Input
                      id="thumbnail"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o que os alunos aprenderão neste curso..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isPremium">Curso Premium</Label>
                      <Switch
                        id="isPremium"
                        checked={formData.isPremium}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="isPublished">Publicar Imediatamente</Label>
                      <Switch
                        id="isPublished"
                        checked={formData.isPublished}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="space-y-6">
              {/* Add New Lesson */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Nova Lição
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lessonTitle">Título da Lição</Label>
                      <Input
                        id="lessonTitle"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Introdução ao Mercado de Câmbio"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lessonDuration">Duração</Label>
                      <Input
                        id="lessonDuration"
                        value={newLesson.duration}
                        onChange={(e) => setNewLesson(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="Ex: 15min"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lessonDescription">Descrição</Label>
                    <Textarea
                      id="lessonDescription"
                      value={newLesson.description}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o conteúdo desta lição..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="videoUrl">URL do Vídeo (PandaVideo)</Label>
                    <Input
                      id="videoUrl"
                      value={newLesson.videoUrl}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://pandavideo.com/..."
                    />
                  </div>
                  <Button type="button" onClick={addLesson} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Lição
                  </Button>
                </CardContent>
              </Card>

              {/* Lessons List */}
              {lessons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lições do Curso ({lessons.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lessons.map((lesson, index) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{lesson.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {lesson.duration} • {lesson.description}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLesson(lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {formData.isPublished ? 'Criar e Publicar' : 'Salvar Rascunho'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}