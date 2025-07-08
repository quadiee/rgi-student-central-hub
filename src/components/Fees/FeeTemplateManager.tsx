
import React, { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface FeeTemplate {
  id?: string;
  name: string;
  fee_type_id: string;
  amount: number;
  due_date: string;
  description?: string;
  created_at?: string;
}

interface FeeType {
  id: string;
  name: string;
  description: string;
  is_mandatory: boolean;
}

interface FeeTemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateApplied: (template: FeeTemplate) => void;
}

const FeeTemplateManager: React.FC<FeeTemplateManagerProps> = ({ open, onOpenChange, onTemplateApplied }) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<FeeTemplate[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTemplate, setNewTemplate] = useState<FeeTemplate>({
    name: '',
    fee_type_id: '',
    amount: 0,
    due_date: '',
    description: '',
  });

  useEffect(() => {
    if (open) {
      fetchFeeTypes();
      fetchTemplates();
    }
  }, [open]);

  const fetchFeeTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_types')
        .select('id, name, description, is_mandatory')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFeeTypes(data || []);
    } catch (error) {
      console.error('Error fetching fee types:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fee_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedData = data as FeeTemplate[];
      setTemplates(typedData || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fee templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.fee_type_id || !newTemplate.amount || !newTemplate.due_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fee_templates')
        .insert({
          name: newTemplate.name,
          fee_type_id: newTemplate.fee_type_id,
          amount: newTemplate.amount,
          due_date: newTemplate.due_date,
          description: newTemplate.description || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template saved successfully",
      });

      // Type assertion for the returned data
      const savedTemplate = data as FeeTemplate;
      setTemplates([savedTemplate, ...templates]);
      setNewTemplate({
        name: '',
        fee_type_id: '',
        amount: 0,
        due_date: '',
        description: '',
      });
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template: FeeTemplate) => {
    onTemplateApplied(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fee Templates</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create New Template */}
          <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-medium">Create New Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="e.g., Semester Fee Template"
                />
              </div>

              <div>
                <Label htmlFor="fee-type">Fee Type *</Label>
                <Select 
                  value={newTemplate.fee_type_id} 
                  onValueChange={(value) => setNewTemplate({...newTemplate, fee_type_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newTemplate.amount || ''}
                  onChange={(e) => setNewTemplate({...newTemplate, amount: parseFloat(e.target.value)})}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <Label htmlFor="due-date">Due Date *</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={newTemplate.due_date}
                  onChange={(e) => setNewTemplate({...newTemplate, due_date: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTemplate.description || ''}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
            </div>

            <Button 
              onClick={saveTemplate}
              disabled={loading}
              className="w-full mt-2"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>

          {/* Template List */}
          <div className="space-y-3">
            <h3 className="font-medium">Saved Templates</h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div>
                {templates.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No templates found. Create your first template above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templates.map(template => {
                      const feeType = feeTypes.find(type => type.id === template.fee_type_id);
                      
                      return (
                        <Card key={template.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => applyTemplate(template)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{template.name}</h4>
                                  <Badge variant="outline">₹{template.amount.toLocaleString()}</Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {feeType?.name || 'Unknown Fee Type'} • 
                                  Due: {new Date(template.due_date).toLocaleDateString()}
                                </p>
                                {template.description && (
                                  <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                                )}
                              </div>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applyTemplate(template);
                                }}
                              >
                                Apply
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeeTemplateManager;
