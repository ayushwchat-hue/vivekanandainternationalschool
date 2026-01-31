import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, GraduationCap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { z } from 'zod';

const admissionSchema = z.object({
  studentName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  parentName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  phone: z.string().trim().min(10, 'Invalid phone number').max(15, 'Phone number too long'),
  classApplying: z.string().min(1, 'Please select a class'),
  previousSchool: z.string().max(200, 'Previous school name too long').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  message: z.string().max(1000, 'Message too long').optional(),
});

const classOptions = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
];

const Admission = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    email: '',
    phone: '',
    classApplying: '',
    previousSchool: '',
    address: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const result = admissionSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from('admission_inquiries').insert({
      student_name: formData.studentName.trim(),
      parent_name: formData.parentName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      class_applying: formData.classApplying,
      previous_school: formData.previousSchool.trim() || null,
      address: formData.address.trim() || null,
      message: formData.message.trim() || null,
    });

    if (error) {
      toast({
        title: 'Submission Failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } else {
      setIsSubmitted(true);
    }

    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-accent-foreground" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Application Submitted!
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Thank you for your interest in Vivekananda International School. 
                Our admissions team will contact you within 2-3 business days.
              </p>
              <Button asChild size="lg">
                <Link to="/">
                  Return to Home
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-primary py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/20 rounded-full px-4 py-2 mb-4">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">Admissions Open</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Apply for Admission
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Join our community of learners. Fill out the form below and take the first step 
              towards an excellent education for your child.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              
              <div className="bg-card rounded-2xl p-6 md:p-8 card-shadow border border-border">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Admission Inquiry Form
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Student Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground border-b border-border pb-2">
                      Student Details
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentName">Student's Full Name *</Label>
                        <Input
                          id="studentName"
                          placeholder="Enter student's name"
                          value={formData.studentName}
                          onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                          required
                          className="h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="classApplying">Class Applying For *</Label>
                        <Select
                          value={formData.classApplying}
                          onValueChange={(value) => setFormData({ ...formData, classApplying: value })}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classOptions.map((cls) => (
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="previousSchool">Previous School (if any)</Label>
                      <Input
                        id="previousSchool"
                        placeholder="Enter previous school name"
                        value={formData.previousSchool}
                        onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>
                  
                  {/* Parent Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground border-b border-border pb-2">
                      Parent/Guardian Details
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                      <Input
                        id="parentName"
                        placeholder="Enter parent's name"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your complete address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground border-b border-border pb-2">
                      Additional Information
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Any Message or Query</Label>
                      <Textarea
                        id="message"
                        placeholder="Share any additional information or questions"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full h-12 gap-2" disabled={isLoading}>
                    {isLoading ? (
                      'Submitting...'
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Admission;
