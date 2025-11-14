import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import Layout from '@/components/Layout';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading notes",
        description: error.message,
      });
    } else {
      setNotes(data || []);
    }
  };

  const saveNote = async () => {
    if (!user || !title || !content) return;

    if (editingNote) {
      const { error } = await supabase
        .from('notes')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', editingNote.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Success",
          description: "Note updated successfully",
        });
      }
    } else {
      const { error } = await supabase
        .from('notes')
        .insert({ user_id: user.id, title, content });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Success",
          description: "Note created successfully",
        });
      }
    }

    setIsDialogOpen(false);
    setTitle('');
    setContent('');
    setEditingNote(null);
    loadNotes();
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      loadNotes();
    }
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setIsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Notes</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Note title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write your notes here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                  />
                </div>
                <Button onClick={saveNote} className="w-full">
                  {editingNote ? 'Update Note' : 'Save Note'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {notes.length === 0 ? (
          <Card className="shadow-medium">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No notes yet</p>
              <Button onClick={openNewDialog} className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <CardDescription>
                    {new Date(note.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {note.content}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(note)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notes;