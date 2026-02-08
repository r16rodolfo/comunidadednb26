import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, BookOpen, Video, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreateCourseModal } from '@/components/admin/CreateCourseModal';
import { useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { mockAdminCourses } from '@/data/mock-academy';
import { Course } from '@/types/academy';

const formatTotalDuration = (course: Course) => {
  const totalSeconds = course.modules.reduce(
    (sum, mod) => sum + mod.lessons.reduce((s, l) => s + l.duration, 0),
    0
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
};

export default function Content() {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const courses = mockAdminCourses;

  const filteredCourses = searchTerm
    ? courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : courses;

  const stats = {
    totalCourses: courses.length,
    totalLessons: courses.reduce((sum, c) => sum + c.total_lessons, 0),
    published: courses.filter(c => c.is_published).length,
    freeLessons: courses.reduce(
      (sum, c) => sum + c.modules.reduce(
        (s, m) => s + m.lessons.filter(l => l.is_free).length, 0
      ), 0
    ),
  };

  return (
    <Layout>
      <div className="space-y-6">
        <AdminPageHeader icon={BookOpen} title="Gestão de Conteúdo" description="Gerencie cursos e aulas da plataforma">
          <Button onClick={() => setShowCourseModal(true)}><Plus className="h-4 w-4 mr-2" />Novo Curso</Button>
        </AdminPageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Cursos" value={stats.totalCourses} icon={BookOpen} />
          <StatCard label="Aulas" value={stats.totalLessons} icon={Video} variant="info" />
          <StatCard label="Publicados" value={stats.published} icon={Users} variant="success" />
          <StatCard label="Aulas Gratuitas" value={stats.freeLessons} icon={Video} variant="warning" />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cursos ({filteredCourses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Módulos</TableHead>
                    <TableHead>Aulas</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Acesso</TableHead>
                    <TableHead className="w-[50px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => {
                    const freeCount = course.modules.reduce(
                      (s, m) => s + m.lessons.filter(l => l.is_free).length, 0
                    );
                    const premiumCount = course.total_lessons - freeCount;

                    return (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{course.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{course.modules.length}</TableCell>
                        <TableCell>{course.total_lessons}</TableCell>
                        <TableCell>{formatTotalDuration(course)}</TableCell>
                        <TableCell>
                          <Badge variant={course.is_published ? 'default' : 'secondary'}>
                            {course.is_published ? 'Publicado' : 'Rascunho'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {freeCount > 0 && (
                              <Badge variant="outline" className="text-xs">{freeCount} grátis</Badge>
                            )}
                            {premiumCount > 0 && (
                              <Badge variant="secondary" className="text-xs">{premiumCount} premium</Badge>
                            )}
                          </div>
                        </TableCell>
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
                              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <CreateCourseModal open={showCourseModal} onOpenChange={setShowCourseModal} />
      </div>
    </Layout>
  );
}
