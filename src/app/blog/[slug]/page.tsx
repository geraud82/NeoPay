'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface BlogPost {
  id: number
  title: string
  excerpt: string
  author: string
  date: string
  category: string
  image?: string
  slug: string
  content?: string
}

export default function BlogPostDetail() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // In a real app, you would fetch the post data from an API
    // For now, we'll use mock data
    const fetchPost = async () => {
      setIsLoading(true)
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock data for the blog post
        const mockPosts: BlogPost[] = [
          {
            id: 1,
            title: 'Optimizing Fleet Management with AI',
            excerpt: 'Learn how artificial intelligence is revolutionizing fleet management and improving efficiency.',
            author: 'John Smith',
            date: '2025-03-01',
            category: 'Technology',
            slug: 'optimizing-fleet-management-with-ai',
            content: `
              <h2>Introduction to AI in Fleet Management</h2>
              <p>Artificial Intelligence (AI) is transforming the way fleet managers operate their vehicles and manage their drivers. By leveraging machine learning algorithms and data analytics, companies can optimize routes, predict maintenance needs, and improve overall efficiency.</p>
              
              <h2>Key Benefits of AI-Powered Fleet Management</h2>
              <p>Implementing AI in your fleet operations can lead to significant improvements in several areas:</p>
              <ul>
                <li>Reduced fuel consumption through optimized routing</li>
                <li>Decreased maintenance costs through predictive maintenance</li>
                <li>Improved driver safety through real-time monitoring and feedback</li>
                <li>Enhanced customer satisfaction through more accurate delivery estimates</li>
                <li>Decreased administrative burden through automated reporting</li>
              </ul>
              
              <h2>Real-World Applications</h2>
              <p>Many companies have already begun implementing AI solutions in their fleet management systems. For example, logistics companies are using AI to optimize delivery routes based on traffic patterns, weather conditions, and delivery windows. This has resulted in fuel savings of up to 15% and increased on-time deliveries by 25%.</p>
              
              <h2>Getting Started with AI in Your Fleet</h2>
              <p>If you're interested in implementing AI in your fleet management operations, here are some steps to get started:</p>
              <ol>
                <li>Assess your current data collection capabilities</li>
                <li>Identify specific areas where AI could improve efficiency</li>
                <li>Research fleet management software with AI capabilities</li>
                <li>Start with a pilot program to test effectiveness</li>
                <li>Scale implementation based on results</li>
              </ol>
              
              <h2>Conclusion</h2>
              <p>AI is no longer just a futuristic concept in fleet management—it's a practical tool that can deliver real benefits today. By embracing these technologies, fleet managers can stay competitive in an increasingly data-driven industry.</p>
            `
          },
          {
            id: 2,
            title: 'Top 5 Ways to Reduce Fleet Expenses',
            excerpt: 'Discover practical strategies to minimize costs and maximize profits in your fleet operations.',
            author: 'Sarah Johnson',
            date: '2025-02-15',
            category: 'Finance',
            slug: 'top-5-ways-to-reduce-fleet-expenses',
            content: `
              <h2>Introduction</h2>
              <p>Managing fleet expenses is crucial for maintaining profitability in transportation and logistics businesses. With rising fuel costs, maintenance expenses, and other operational overheads, finding ways to reduce expenses without compromising service quality is more important than ever.</p>
              
              <h2>1. Implement Preventive Maintenance Programs</h2>
              <p>Regular preventive maintenance can significantly reduce the likelihood of major repairs and extend the lifespan of your vehicles. Develop a comprehensive maintenance schedule based on manufacturer recommendations and stick to it rigorously.</p>
              
              <h2>2. Optimize Route Planning</h2>
              <p>Efficient route planning can lead to substantial fuel savings and increased productivity. Utilize route optimization software to minimize distance traveled, avoid traffic congestion, and reduce idle time.</p>
              
              <h2>3. Monitor and Improve Driver Behavior</h2>
              <p>Driver behavior directly impacts fuel consumption, vehicle wear and tear, and accident rates. Implement driver monitoring systems and provide training to encourage fuel-efficient driving practices and reduce aggressive driving behaviors.</p>
              
              <h2>4. Leverage Telematics Data</h2>
              <p>Telematics systems provide valuable data on vehicle performance, fuel consumption, and driver behavior. Use this data to identify inefficiencies and make data-driven decisions to reduce costs.</p>
              
              <h2>5. Implement Fuel Management Strategies</h2>
              <p>Fuel typically represents one of the largest expenses for fleet operations. Implement fuel cards with discounts, monitor fuel consumption patterns, and consider alternative fuel options where feasible.</p>
              
              <h2>Conclusion</h2>
              <p>By implementing these strategies, fleet managers can significantly reduce operational expenses while maintaining or even improving service quality. Remember that even small savings per vehicle can add up to substantial amounts across an entire fleet.</p>
            `
          }
        ]
        
        const foundPost = mockPosts.find(p => p.slug === params.slug)
        
        if (foundPost) {
          setPost(foundPost)
        } else {
          // If post not found, redirect to blog listing
          router.push('/blog')
        }
      } catch (error) {
        console.error('Error fetching blog post:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (params.slug) {
      fetchPost()
    }
  }, [params.slug, router])
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    )
  }
  
  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
        <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
        <Link href="/blog" className="text-primary hover:underline">
          Return to Blog
        </Link>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/blog" className="text-primary hover:underline flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </Link>
      </div>
      
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {post.image ? (
          <div className="h-64 md:h-96 bg-gray-200">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-64 md:h-96 bg-gray-200 flex items-center justify-center">
            <svg className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <div className="flex items-center mb-4">
            <span className="inline-block px-3 py-1 text-sm font-semibold bg-gray-100 text-gray-800 rounded-full">
              {post.category}
            </span>
            <span className="ml-4 text-sm text-gray-500">
              {formatDate(post.date)}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center mb-8">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              <span className="text-gray-500 font-semibold">{post.author.charAt(0)}</span>
            </div>
            <span className="text-gray-700">By {post.author}</span>
          </div>
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </div>
      </article>
      
      <div className="mt-12 flex justify-between items-center">
        <Link href="/blog" className="text-primary hover:underline flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </Link>
        
        <div className="flex space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
