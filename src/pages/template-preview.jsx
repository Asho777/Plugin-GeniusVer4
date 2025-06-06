import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { generatePlugin } from '../services/plugin-service';

// Template data from templates.jsx
const templatesData = [
  {
    id: 'social-share',
    title: 'Social Share Buttons',
    description: 'Add customizable social sharing buttons to your posts and pages',
    type: 'content',
    image: 'https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'related-posts',
    title: 'Related Posts Widget',
    description: 'Display related posts based on categories or tags',
    type: 'widget',
    image: 'https://images.pexels.com/photos/6177645/pexels-photo-6177645.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'contact-form',
    title: 'Simple Contact Form',
    description: 'Add a customizable contact form via shortcode',
    type: 'shortcode',
    image: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'seo-meta',
    title: 'SEO Meta Fields',
    description: 'Add custom SEO meta fields to posts and pages',
    type: 'admin',
    image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'cookie-notice',
    title: 'Cookie Consent Notice',
    description: 'Display a customizable cookie consent notice',
    type: 'custom',
    image: 'https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'product-gallery',
    title: 'Enhanced Product Gallery',
    description: 'Improve WooCommerce product galleries with zoom and lightbox',
    type: 'ecommerce',
    image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
];

export function TemplatePreviewPage() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState(null);
  const [plugin, setPlugin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');

  useEffect(() => {
    // Find the template by ID
    const foundTemplate = templatesData.find(t => t.id === templateId);
    
    if (foundTemplate) {
      setTemplate(foundTemplate);
      
      // Generate plugin preview based on template
      setLoading(true);
      generatePlugin({
        title: foundTemplate.title,
        description: foundTemplate.description,
        type: foundTemplate.type,
        templateId: foundTemplate.id
      }).then(generatedPlugin => {
        setPlugin(generatedPlugin);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [templateId]);

  if (loading) {
    return (
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">Generating plugin preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Template Not Found</h1>
            <p className="mb-6">The template you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/templates">Back to Templates</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link to="/templates" className="text-primary hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Templates
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="h-48 overflow-hidden">
                <img 
                  src={template.image} 
                  alt={template.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full px-2 py-1">
                    {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold mb-2">{template.title}</h1>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <Button asChild className="w-full">
                  <Link to={`/create?template=${template.id}&type=${template.type}&title=${encodeURIComponent(template.title)}&description=${encodeURIComponent(template.description)}`}>
                    Use This Template
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {plugin && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Plugin Preview</h2>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="preview">Overview</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview" className="p-4 border rounded-md">
                    <div className="prose max-w-none">
                      <h3>Plugin Details</h3>
                      <ul>
                        <li><strong>Name:</strong> {plugin.name}</li>
                        <li><strong>Type:</strong> {plugin.type}</li>
                        <li><strong>Description:</strong> {plugin.description}</li>
                      </ul>
                      
                      <h3>Features</h3>
                      <ul>
                        {plugin.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="code" className="mt-2">
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 text-sm font-medium border-b">
                        {plugin.slug}.php
                      </div>
                      <pre className="p-4 overflow-auto text-sm bg-gray-50 max-h-[400px]">
                        <code>{plugin.mainFile}</code>
                      </pre>
                    </div>
                    
                    {plugin.additionalFiles && Object.entries(plugin.additionalFiles).map(([path, content]) => (
                      <div key={path} className="border rounded-md overflow-hidden mt-4">
                        <div className="bg-gray-100 px-4 py-2 text-sm font-medium border-b">
                          {path}
                        </div>
                        <pre className="p-4 overflow-auto text-sm bg-gray-50 max-h-[400px]">
                          <code>{content}</code>
                        </pre>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="instructions" className="p-4 border rounded-md">
                    <div className="prose max-w-none">
                      <h3>Installation Instructions</h3>
                      <ol>
                        <li>Download the plugin ZIP file.</li>
                        <li>Log in to your WordPress admin dashboard.</li>
                        <li>Navigate to Plugins → Add New → Upload Plugin.</li>
                        <li>Choose the downloaded ZIP file and click "Install Now".</li>
                        <li>After installation completes, click "Activate Plugin".</li>
                      </ol>
                      
                      <h3>Usage Instructions</h3>
                      <div dangerouslySetInnerHTML={{ __html: plugin.instructions }} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
