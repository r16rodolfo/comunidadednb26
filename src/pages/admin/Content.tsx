import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye, BookOpen, Video, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreateCourseModal } from '@/components/admin/CreateCourseModal';
import { useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { mockCourses } from '@/data/mock-admin';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Publicado':
    case 'Ativo': return 'default' as const;
    case 'Rascunho': return 'secondary' as const;
    case 'Inativo': return 'destructive' as const;
    default: return 'outline' as const;
  }
};

export default function Content() {
  const [activeTab, setActiveTab] = useState('courses');
  const [showCourseModal, setShowCourseModal] = useState(false);

  const stats = {
    total: mockCourses.length,
    published: mockCourses.filter(c => c.status === 'Publicado').length,
    totalStudents: mockCourses.reduce((sum, c) => sum + c.students, 0),
  };

  return (
    <Layout>
      <div className="space-y-6">
        <AdminPageHeader icon={BookOpen} title="Gestão de Conteúdo" description="Gerencie aulas da plataforma">
          <Button onClick={() => setShowCourseModal(true)}><Plus className="h-4 w-4 mr-2" />Nova Aula</Button>
        </AdminPageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total de Aulas" value={stats.total} icon={BookOpen} />
          <StatCard label="Publicadas" value={stats.published} icon={Video} variant="success" />
          <StatCard label="Total de Alunos" value={stats.totalStudents} icon={Users} variant="info" />
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="courses" className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Aulas DNB Academy</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar aulas..." className="pl-10" />
                  </div>
                  <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filtros</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aulas ({mockCourses.length})</CardTitle>
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
                      {mockCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{course.title}</div>
                              <div className="text-sm text-muted-foreground">{course.description}</div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline">{course.category}</Badge></TableCell>
                          <TableCell><Badge variant={getStatusVariant(course.status)}>{course.status}</Badge></TableCell>
                          <TableCell>{course.duration}</TableCell>
                          <TableCell>{course.lessons}</TableCell>
                          <TableCell>{course.students}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem>
                                <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                <DropdownMenuItem><Video className="mr-2 h-4 w-4" />Gerenciar Vídeos</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
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

        <CreateCourseModal open={showCourseModal} onOpenChange={setShowCourseModal} />
      </div>
    </Layout>
  );
}
