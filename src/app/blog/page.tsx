'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface BlogPost {
  id: number
  title: string
  excerpt: string
  author: string
  date: string
  category: string
  image?: string
  slug: string
}

export default function Blog() {
  const { user } = useAuth()
  // Mock data for blog posts
  const initialPosts: BlogPost[] = [
    {
      id: 1,
      title: 'Optimizing Fleet Management with AI',
      excerpt: 'Learn how artificial intelligence is revolutionizing fleet management and improving efficiency.',
      author: 'John Smith',
      date: '2025-03-01',
      category: 'Technology',
      slug: 'optimizing-fleet-management-with-ai'
    },
    {
      id: 2,
      title: 'Top 5 Ways to Reduce Fleet Expenses',
      excerpt: 'Discover practical strategies to minimize costs and maximize profits in your fleet operations.',
      author: 'Sarah Johnson',
      date: '2025-02-15',
      category: 'Finance',
      slug: 'top-5-ways-to-reduce-fleet-expenses'
    },
    {
      id: 3,
      title: 'The Future of Electric Vehicles in Fleet Management',
      excerpt: 'Explore how electric vehicles are changing the landscape of fleet management and what it means for your business.',
      author: 'Michael Brown',
      date: '2025-02-01',
      category: 'Sustainability',
      slug: 'future-of-electric-vehicles-in-fleet-management'
    },
    {
      id: 4,
      title: 'Implementing Effective Driver Safety Programs',
      excerpt: 'Learn how to create and maintain safety programs that protect your drivers and reduce liability.',
      author: 'Emily Davis',
      date: '2025-01-20',
      category: 'Safety',
      slug: 'implementing-effective-driver-safety-programs'
    },
    {
      id: 5,
      title: 'How to Choose the Right Fleet Management Software',
      excerpt: 'A comprehensive guide to selecting the best fleet management software for your specific business needs.',
      author: 'David Wilson',
      date: '2025-01-05',
      category: 'Technology',
      slug: 'how-to-choose-the-right-fleet-management-software'
    },
    {
      id: 6,
      title: 'Navigating Regulatory Compliance in Fleet Operations',
      excerpt: 'Stay ahead of changing regulations and ensure your fleet operations remain compliant with this helpful guide.',
      author: 'Jennifer Lee',
      date: '2024-12-15',
      category: 'Compliance',
      slug: 'navigating-regulatory-compliance-in-fleet-operations'
    }
  ]
  
  const [posts] = useState<BlogPost[]>(initialPosts)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Get unique categories
  const uniqueCategories = Array.from(new Set(posts.map(post => post.category)))
  const categories = ['all', ...uniqueCategories]
  
  // Filter posts based on category and search term
  const filteredPosts = posts.filter(post => {
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
  })
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fleet Management Blog</h1>
          <p className="text-gray-600">Stay updated with the latest trends and insights in fleet management</p>
        </div>
        {user && (
          <Link href="/blog/create" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">
            Create Post
          </Link>
        )}
      </div>
      
      {/* Search and filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search articles..."
            className="input w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="w-full md:w-64">
          <select
            className="input w-full"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Blog posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {post.image ? (
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center mb-2">
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                  {post.category}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {formatDate(post.date)}
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">By {post.author}</span>
                <Link href={`/blog/${post.slug}`} className="text-primary hover:text-blue-700 font-medium">
                  Read More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No articles found</h3>
          <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      )}
    </div>
  )
}
