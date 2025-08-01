'use client';

import React, { useState } from 'react';
import BenefitCardClient from '@/components/BenefitCardClient';
import CategoryBenefitsGroup from '@/components/CategoryBenefitsGroup';
import type { DisplayBenefitStatus } from '@/app/benefits/page';
import Link from 'next/link';

interface BenefitsDisplayProps {
  upcomingBenefits: DisplayBenefitStatus[];
  completedBenefits: DisplayBenefitStatus[];
  notUsableBenefits: DisplayBenefitStatus[];
  totalUnusedValue: number;
  totalUsedValue: number;
  totalNotUsableValue: number;
  totalAnnualFees: number;
}

export default function BenefitsDisplayClient({
  upcomingBenefits,
  completedBenefits,
  notUsableBenefits,
  totalUnusedValue,
  totalUsedValue,
  totalNotUsableValue,
  totalAnnualFees,
}: BenefitsDisplayProps) {
  const [activeTab, setActiveTab] = useState('upcoming');

  const [viewMode, setViewMode] = useState<'list' | 'category' | 'card'>('list');
  const [localUpcomingBenefits, setLocalUpcomingBenefits] = useState(upcomingBenefits);
  const [localCompletedBenefits, setLocalCompletedBenefits] = useState(completedBenefits);
  const [localNotUsableBenefits, setLocalNotUsableBenefits] = useState(notUsableBenefits);
  const [localTotalUnusedValue, setLocalTotalUnusedValue] = useState(totalUnusedValue);
  const [localTotalUsedValue, setLocalTotalUsedValue] = useState(totalUsedValue);
  const [localTotalNotUsableValue, setLocalTotalNotUsableValue] = useState(totalNotUsableValue);



  const handleStatusChange = (statusId: string, newIsCompleted: boolean) => {
    if (newIsCompleted) {
      // Moving from upcoming to completed
      const benefitToMove = localUpcomingBenefits.find(b => b.id === statusId);
      if (benefitToMove) {
        const updatedBenefit = { ...benefitToMove, isCompleted: true, completedAt: new Date() };
        setLocalUpcomingBenefits(prev => prev.filter(b => b.id !== statusId));
        setLocalCompletedBenefits(prev => [...prev, updatedBenefit]);
        
        // Update totals
        const benefitValue = benefitToMove.benefit.maxAmount || 0;
        setLocalTotalUnusedValue(prev => prev - benefitValue);
        setLocalTotalUsedValue(prev => prev + benefitValue);
      }
    } else {
      // Moving from completed to upcoming
      const benefitToMove = localCompletedBenefits.find(b => b.id === statusId);
      if (benefitToMove) {
        const updatedBenefit = { ...benefitToMove, isCompleted: false, completedAt: null };
        setLocalCompletedBenefits(prev => prev.filter(b => b.id !== statusId));
        setLocalUpcomingBenefits(prev => [...prev, updatedBenefit]);
        
        // Update totals
        const benefitValue = benefitToMove.benefit.maxAmount || 0;
        setLocalTotalUsedValue(prev => prev - benefitValue);
        setLocalTotalUnusedValue(prev => prev + benefitValue);
      }
    }
  };

  const handleNotUsableChange = (statusId: string, newIsNotUsable: boolean) => {
    if (newIsNotUsable) {
      // Moving from upcoming to not usable
      const benefitToMove = localUpcomingBenefits.find(b => b.id === statusId);
      if (benefitToMove) {
        const updatedBenefit = { ...benefitToMove, isNotUsable: true, isCompleted: false, completedAt: null };
        setLocalUpcomingBenefits(prev => prev.filter(b => b.id !== statusId));
        setLocalNotUsableBenefits(prev => [...prev, updatedBenefit]);
        
        // Update totals
        const benefitValue = benefitToMove.benefit.maxAmount || 0;
        setLocalTotalUnusedValue(prev => prev - benefitValue);
        setLocalTotalNotUsableValue(prev => prev + benefitValue);
      }
    } else {
      // Moving from not usable back to upcoming
      const benefitToMove = localNotUsableBenefits.find(b => b.id === statusId);
      if (benefitToMove) {
        const updatedBenefit = { ...benefitToMove, isNotUsable: false };
        setLocalNotUsableBenefits(prev => prev.filter(b => b.id !== statusId));
        setLocalUpcomingBenefits(prev => [...prev, updatedBenefit]);
        
        // Update totals
        const benefitValue = benefitToMove.benefit.maxAmount || 0;
        setLocalTotalNotUsableValue(prev => prev - benefitValue);
        setLocalTotalUnusedValue(prev => prev + benefitValue);
      }
    }
  };



  const setListView = () => setViewMode('list');
  const setCategoryView = () => setViewMode('category');
  const setCardView = () => setViewMode('card');

  // Group benefits by category
  const groupBenefitsByCategory = (benefits: DisplayBenefitStatus[]) => {
    const grouped = benefits.reduce((acc, benefit) => {
      const category = benefit.benefit.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(benefit);
      return acc;
    }, {} as Record<string, DisplayBenefitStatus[]>);

    // Sort categories by total value (descending)
    return Object.entries(grouped).sort(([, a], [, b]) => {
      const aTotal = a.reduce((sum, benefit) => sum + (benefit.benefit.maxAmount || 0), 0);
      const bTotal = b.reduce((sum, benefit) => sum + (benefit.benefit.maxAmount || 0), 0);
      return bTotal - aTotal;
    });
  };

  // Group benefits by credit card
  const groupBenefitsByCard = (benefits: DisplayBenefitStatus[]) => {
    const grouped = benefits.reduce((acc, benefit) => {
      const cardName = benefit.benefit.creditCard.name;
      if (!acc[cardName]) {
        acc[cardName] = [];
      }
      acc[cardName].push(benefit);
      return acc;
    }, {} as Record<string, DisplayBenefitStatus[]>);

    // Sort cards by total value (descending)
    return Object.entries(grouped).sort(([, a], [, b]) => {
      const aTotal = a.reduce((sum, benefit) => sum + (benefit.benefit.maxAmount || 0), 0);
      const bTotal = b.reduce((sum, benefit) => sum + (benefit.benefit.maxAmount || 0), 0);
      return bTotal - aTotal;
    });
  };

  const renderBenefitsList = (benefits: DisplayBenefitStatus[]) => {
    if (benefits.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming benefits' : 
             activeTab === 'completed' ? 'No completed benefits yet' : 
             'No not usable benefits'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {activeTab === 'upcoming' 
              ? 'Add credit cards with benefits to start tracking your rewards and credits.'
              : activeTab === 'completed' 
                ? 'Mark benefits as complete when you use them to track your ROI.'
                : 'Benefits marked as not usable will appear here.'
            }
          </p>
          {activeTab === 'upcoming' && (
            <Link
              href="/cards/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Card
            </Link>
          )}
        </div>
      );
    }



    return (
      <div className="space-y-4">
        {benefits.map(status => (
          <BenefitCardClient key={status.id} status={status} onStatusChange={handleStatusChange} onNotUsableChange={handleNotUsableChange} />
        ))}
      </div>
    );
  };

  const renderCategoryView = (benefits: DisplayBenefitStatus[]) => {
    if (benefits.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming benefits' : 
             activeTab === 'completed' ? 'No completed benefits yet' : 
             'No not usable benefits'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {activeTab === 'upcoming' 
              ? 'Add credit cards with benefits to start tracking your rewards and credits.'
              : activeTab === 'completed' 
                ? 'Mark benefits as complete when you use them to track your ROI.'
                : 'Benefits marked as not usable will appear here.'
            }
          </p>
          {activeTab === 'upcoming' && (
            <Link
              href="/cards/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Card
            </Link>
          )}
        </div>
      );
    }

    const categorizedBenefits = groupBenefitsByCategory(benefits);
    
    return (
      <div className="space-y-6">
        {categorizedBenefits.map(([category, categoryBenefits]) => (
          <CategoryBenefitsGroup
            key={category}
            category={category}
            benefits={categoryBenefits}
            onStatusChange={handleStatusChange}
            onNotUsableChange={handleNotUsableChange}
          />
        ))}
      </div>
    );
  };

  const renderCardView = (benefits: DisplayBenefitStatus[]) => {
    if (benefits.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-200 dark:from-gray-800/50 dark:to-slate-800/50 dark:border-gray-700">
          <div className="p-4 bg-gray-100 rounded-full dark:bg-gray-700 mb-4">
            <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Benefits Available</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming benefits. Add some credit cards to get started!" 
              : activeTab === 'completed'
              ? "No completed benefits yet. Start using your credit card benefits!"
              : "No unusable benefits found."}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              href="/cards/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Credit Card
            </Link>
          )}
        </div>
      );
    }

    const cardGroupedBenefits = groupBenefitsByCard(benefits);
    
    return (
      <div className="space-y-6">
        {cardGroupedBenefits.map(([cardName, cardBenefits]) => (
          <CategoryBenefitsGroup
            key={cardName}
            category={cardName}
            benefits={cardBenefits}
            onStatusChange={handleStatusChange}
            onNotUsableChange={handleNotUsableChange}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Benefits Dashboard</h1>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button
            onClick={setListView}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
            }`}
          >
            <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </button>
          <button
            onClick={setCategoryView}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'category' 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
            }`}
          >
            <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H3m16 14H5" />
            </svg>
            Group by Category
          </button>
          <button
            onClick={setCardView}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'card' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
            }`}
          >
            <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Group by Card
          </button>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Upcoming Benefits Widget */}
        <div className="group overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300 dark:from-blue-900/20 dark:to-indigo-800/20 border border-blue-200 dark:border-blue-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 sm:ml-5 flex-1 min-w-0">
                <dl>
                  <dt className="text-sm font-medium text-blue-600 dark:text-blue-300">Upcoming Benefits</dt>
                  <dd>
                    <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">${localTotalUnusedValue.toFixed(2)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Claimed Benefits Widget */}
        <div className="group overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 dark:from-green-900/20 dark:to-emerald-800/20 border border-green-200 dark:border-green-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 sm:ml-5 flex-1 min-w-0">
                <dl>
                  <dt className="text-sm font-medium text-green-600 dark:text-green-300">Claimed Benefits</dt>
                  <dd>
                    <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">${localTotalUsedValue.toFixed(2)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Not Usable Benefits Widget */}
        <div className="group overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 dark:from-gray-900/20 dark:to-slate-800/20 border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gray-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 sm:ml-5 flex-1 min-w-0">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">Not Usable</dt>
                  <dd>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">${localTotalNotUsableValue.toFixed(2)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Annual Fee ROI Widget */}
        <div className={`group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border ${
          localTotalUsedValue >= totalAnnualFees 
            ? 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 border-emerald-200 dark:border-emerald-700' 
            : 'bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-800/20 border-orange-200 dark:border-orange-700'
        }`}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                  localTotalUsedValue >= totalAnnualFees 
                    ? 'bg-emerald-500' 
                    : 'bg-orange-500'
                }`}>
                  {localTotalUsedValue >= totalAnnualFees ? (
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="ml-4 sm:ml-5 flex-1 min-w-0">
                <dl>
                  <dt className={`text-sm font-medium ${
                    localTotalUsedValue >= totalAnnualFees 
                      ? 'text-emerald-600 dark:text-emerald-300' 
                      : 'text-orange-600 dark:text-orange-300'
                  }`}>
                    Annual Fee ROI
                  </dt>
                  <dd>
                    <div className="space-y-1">
                      <div className={`text-xl sm:text-2xl font-bold ${
                        localTotalUsedValue >= totalAnnualFees 
                          ? 'text-emerald-900 dark:text-emerald-100' 
                          : 'text-orange-900 dark:text-orange-100'
                      }`}>
                        ${(localTotalUsedValue - totalAnnualFees).toFixed(2)}
                      </div>
                      <div className={`text-xs ${
                        localTotalUsedValue >= totalAnnualFees 
                          ? 'text-emerald-600 dark:text-emerald-300' 
                          : 'text-orange-600 dark:text-orange-300'
                      }`}>
                        ${localTotalUsedValue.toFixed(2)} earned vs ${totalAnnualFees.toFixed(2)} fees
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-shrink-0 py-4 px-1 border-b-2 font-medium text-sm 
              ${activeTab === 'upcoming' 
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}
            `}
          >
            <span className="hidden sm:inline">Upcoming ({localUpcomingBenefits.length})</span>
            <span className="sm:hidden">Upcoming ({localUpcomingBenefits.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-shrink-0 py-4 px-1 border-b-2 font-medium text-sm 
              ${activeTab === 'completed' 
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}
            `}
          >
            <span className="hidden sm:inline">Claimed ({localCompletedBenefits.length})</span>
            <span className="sm:hidden">Claimed ({localCompletedBenefits.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('not-usable')}
            className={`flex-shrink-0 py-4 px-1 border-b-2 font-medium text-sm 
              ${activeTab === 'not-usable' 
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}
            `}
          >
            <span className="hidden sm:inline">Not Usable ({localNotUsableBenefits.length})</span>
            <span className="sm:hidden">Not Usable ({localNotUsableBenefits.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'upcoming' && (
          <section>
            {viewMode === 'list' ? renderBenefitsList(localUpcomingBenefits) : 
             viewMode === 'category' ? renderCategoryView(localUpcomingBenefits) : 
             renderCardView(localUpcomingBenefits)}
          </section>
        )}
        {activeTab === 'completed' && (
          <section>
            {viewMode === 'list' ? renderBenefitsList(localCompletedBenefits) : 
             viewMode === 'category' ? renderCategoryView(localCompletedBenefits) : 
             renderCardView(localCompletedBenefits)}
          </section>
        )}
        {activeTab === 'not-usable' && (
          <section>
            {viewMode === 'list' ? renderBenefitsList(localNotUsableBenefits) : 
             viewMode === 'category' ? renderCategoryView(localNotUsableBenefits) : 
             renderCardView(localNotUsableBenefits)}
          </section>
        )}
      </div>
    </div>
  );
} 