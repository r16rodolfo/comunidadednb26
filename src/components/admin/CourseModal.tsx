import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Video, Plus, Trash2, GripVertical, Loader2, Pencil } from 'lucide-react';
import { useAdminAcademy } from '@/hooks/useAdminAcademy';
import type { Course } from '@/types/academy';

interface CourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCourse?: Course | null;
}

interface ModuleForm {
  id: string;
  dbId?: string; // real DB id for existing modules
  title: string;
  description: string;
  lessons: LessonForm[];
}

interface LessonForm {
  id: string;
  dbId?: string; // real DB id for existing lessons
  title: string;
  description: string;
  bunny_video_id: string;
  duration: string;
  is_free: boolean;
}

/** Parse duration string like "15min", "1h30", "480" into seconds */
function parseDuration(input: string): number {
  if (!input) return 0;
  const trimmed = input.trim().toLowerCase();
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  const minMatch = trimmed.match(/^(\d+)\s*m(?:in)?$/);
  if (minMatch) return parseInt(minMatch[1], 10) * 60;
  const hMinMatch = trimmed.match(/^(\d+)\s*h\s*(\d+)?\s*m?(?:in)?$/);
  if (hMinMatch) return parseInt(hMinMatch[1], 10) * 3600 + (parseInt(hMinMatch[2] || '0', 10) * 60);
  return 0;
}

/** Format seconds back into a human-readable duration */
function formatDuration(seconds: number): string {
  if (seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return m > 0 ? `${h}h${m}min` : `${h}h`;
  if (m > 0) return `${m}min`;
  return `${s}`;
}

export function CourseModal({ open, onOpenChange, editingCourse }: CourseModalProps) {
  const isEditMode = !!editingCourse;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_published: false,
  });
  const [modules, setModules] = useState<ModuleForm[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const { toast } = useToast();
  const { createCourse, isCreating, updateCourse, isUpdating } = useAdminAcademy();

  // Populate form when editing
  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title,
        description: editingCourse.description,
        is_published: editingCourse.is_published,
      });
      setModules(
        editingCourse.modules.map((m) => ({
          id: m.id,
          dbId: m.id,
          title: m.title,
          description: m.description || '',
          lessons: m.lessons.map((l) => ({
            id: l.id,
            dbId: l.id,
            title: l.title,
            description: l.description || '',
            bunny_video_id: l.bunny_video_id,
            duration: formatDuration(l.duration),
            is_free: l.is_free,
          })),
        }))
      );
    } else {
      resetForm();
    }
  }, [editingCourse, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast({ title: 'Erro', description: 'O título do curso é obrigatório.', variant: 'destructive' });
      return;
    }

    try {
      if (isEditMode && editingCourse) {
        await updateCourse({
          id: editingCourse.id,
          title: formData.title,
          description: formData.description,
          is_published: formData.is_published,
          modules: modules.map((m) => ({
            id: m.dbId,
            title: m.title,
            description: m.description,
            lessons: m.lessons.map((l) => ({
              id: l.dbId,
              title: l.title,
              description: l.description,
              bunny_video_id: l.bunny_video_id,
              duration: parseDuration(l.duration),
              is_free: l.is_free,
            })),
          })),
        });
        toast({
          title: 'Curso atualizado!',
          description: `"${formData.title}" foi salvo com sucesso.`,
        });
      } else {
        await createCourse({
          title: formData.title,
          description: formData.description,
          is_published: formData.is_published,
          modules: modules.map((m) => ({
            title: m.title,
            description: m.description,
            lessons: m.lessons.map((l) => ({
              title: l.title,
              description: l.description,
              bunny_video_id: l.bunny_video_id,
              duration: parseDuration(l.duration),
              is_free: l.is_free,
            })),
          })),
        });
        toast({
          title: 'Curso criado com sucesso!',
          description: `"${formData.title}" foi ${formData.is_published ? 'publicado' : 'salvo como rascunho'}.`,
        });
      }
      onOpenChange(false);
      resetForm();
    } catch {
      toast({ title: isEditMode ? 'Erro ao atualizar curso' : 'Erro ao criar curso', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', is_published: false });
    setModules([]);
    setNewModuleTitle('');
  };

  const addModule = () => {
    if (!newModuleTitle.trim()) {
      toast({ title: 'Erro', description: 'O título do módulo é obrigatório.', variant: 'destructive' });
      return;
    }
    setModules((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newModuleTitle.trim(), description: '', lessons: [] },
    ]);
    setNewModuleTitle('');
  };

  const removeModule = (moduleId: string) => setModules((prev) => prev.filter((m) => m.id !== moduleId));

  const addLesson = (moduleId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id !== moduleId
          ? m
          : {
              ...m,
              lessons: [
                ...m.lessons,
                { id: Date.now().toString(), title: '', description: '', bunny_video_id: '', duration: '', is_free: false },
              ],
            }
      )
    );
  };

  const updateLesson = (moduleId: string, lessonId: string, field: string, value: string | boolean) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id !== moduleId
          ? m
          : { ...m, lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, [field]: value } : l)) }
      )
    );
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id !== moduleId ? m : { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }))
    );
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const isBusy = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? <Pencil className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            {isEditMode ? 'Editar Curso' : 'Criar Novo Curso'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="content">Conteúdo {totalLessons > 0 && `(${totalLessons} aulas)`}</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Curso *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} placeholder="Ex: Fundamentos do Câmbio" required />
                </div>
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Descreva o que os alunos aprenderão neste curso..." className="min-h-[100px]" required />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="isPublished" className="font-medium">Publicar Imediatamente</Label>
                    <p className="text-sm text-muted-foreground">O curso ficará visível para os usuários</p>
                  </div>
                  <Switch id="isPublished" checked={formData.is_published} onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_published: checked }))} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <Input value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} placeholder="Nome do módulo (ex: Introdução ao Câmbio)" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addModule())} />
                    <Button type="button" onClick={addModule} variant="outline"><Plus className="h-4 w-4 mr-2" />Módulo</Button>
                  </div>
                </CardContent>
              </Card>

              {modules.map((module, moduleIndex) => (
                <Card key={module.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">Módulo {moduleIndex + 1}: {module.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">{module.lessons.length} {module.lessons.length === 1 ? 'aula' : 'aulas'}</Badge>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeModule(module.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Aula {lessonIndex + 1}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`free-${lesson.id}`} className="text-sm">Gratuita</Label>
                              <Switch id={`free-${lesson.id}`} checked={lesson.is_free} onCheckedChange={(checked) => updateLesson(module.id, lesson.id, 'is_free', checked)} />
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeLesson(module.id, lesson.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Título *</Label>
                            <Input value={lesson.title} onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)} placeholder="Título da aula" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Bunny Video ID</Label>
                              <Input value={lesson.bunny_video_id} onChange={(e) => updateLesson(module.id, lesson.id, 'bunny_video_id', e.target.value)} placeholder="ex: eb1c4f77-..." />
                            </div>
                            <div>
                              <Label className="text-xs">Duração</Label>
                              <Input value={lesson.duration} onChange={(e) => updateLesson(module.id, lesson.id, 'duration', e.target.value)} placeholder="ex: 15min" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Descrição</Label>
                          <Textarea value={lesson.description} onChange={(e) => updateLesson(module.id, lesson.id, 'description', e.target.value)} placeholder="Descreva o conteúdo desta aula..." className="min-h-[60px]" />
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full" onClick={() => addLesson(module.id)}><Plus className="h-4 w-4 mr-2" />Adicionar Aula</Button>
                  </CardContent>
                </Card>
              ))}

              {modules.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                  <Video className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhum módulo criado</p>
                  <p className="text-sm mt-1">Adicione um módulo acima para começar a organizar as aulas</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isEditMode ? 'Salvando...' : 'Criando...'}</>
              ) : isEditMode ? (
                'Salvar Alterações'
              ) : formData.is_published ? (
                'Criar e Publicar'
              ) : (
                'Salvar Rascunho'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
