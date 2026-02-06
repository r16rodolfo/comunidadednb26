import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  BookOpen,
  Video
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateCourseModal } from '@/components/admin/CreateCourseModal';
import { useState } from 'react';

// Mock data for courses
const courses = [
  {
    id: '1',
    title: 'Fundamentos do Câmbio',
    description: 'Aprenda os conceitos básicos do mercado de câmbio',
    status: 'Publicado',
    duration: '2h 30min',
    lessons: 8,
    students: 245,
    category: 'Iniciante',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    title: 'Estratégias Avançadas de Câmbio',
    description: 'Técnicas avançadas para otimizar suas operações',
    status: 'Rascunho',
    duration: '3h 15min',
    lessons: 12,
    students: 0,
    category: 'Avançado',
    createdAt: '2024-01-15'
  }
];


const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Publicado':
    case 'Ativo': return 'default';
    case 'Rascunho': return 'secondary';
    case 'Inativo': return 'destructive';
    default: return 'outline';
  }
};

export default function Content() {
  const [activeTab, setActiveTab] = useState('courses');
  const [showCourseModal, setShowCourseModal] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Conteúdo</h1>
            <p className="text-muted-foreground">Gerencie aulas da plataforma</p>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Aulas DNB Academy
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar aulas..." 
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
              <Button onClick={() => setShowCourseModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Aula
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Aulas ({courses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Aulas</TableHead>
                        <TableHead>Alunos</TableHead>
                        <TableHead className="w-[50px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{course.title}</div>
                              <div className="text-sm text-muted-foreground">{course.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{course.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(course.status)}>
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{course.duration}</TableCell>
                          <TableCell>{course.lessons}</TableCell>
                          <TableCell>{course.students}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Video className="mr-2 h-4 w-4" />
                                  Gerenciar Vídeos
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Modals */}
        <CreateCourseModal 
          open={showCourseModal} 
          onOpenChange={setShowCourseModal}
        />
      </div>
    </Layout>
  );
}