'use server';
import 'server-only';
import { adminDb } from '@/lib/firebase/admin-app';
import { unstable_cache } from 'next/cache';

async function getStatsUncached() {
    const usersSnapshot = await adminDb.collection('users').where('role', '==', 'member').get();
    const serviceRequestsSnapshot = await adminDb.collection('serviceRequests').get();
    const siteVisitsSnapshot = await adminDb.collection('siteVisits').get();

    const activeMembers = usersSnapshot.docs.filter(doc => doc.data().status === 'active').length;
    const lifetimeApplications = usersSnapshot.docs.filter(doc => doc.data().lifetimeStatus === 'applied').length;

    const allMembers = usersSnapshot.docs.map(doc => ({
        createdAt: new Date(doc.data().createdAt),
        status: doc.data().status
    }));

    const serviceRequests = serviceRequestsSnapshot.docs.map(doc => ({
        status: doc.data().status
    }));

    return {
        totalMembers: activeMembers,
        lifetimeApplicationsCount: lifetimeApplications,
        serviceRequestsCount: serviceRequestsSnapshot.size,
        siteVisitsCount: siteVisitsSnapshot.size,
        allMembersData: allMembers,
        serviceRequestsData: serviceRequests,
    };
}

// Cache the stats for 10 minutes to avoid excessive Firestore reads
export const getStats = unstable_cache(
  async () => getStatsUncached(),
  ['admin-stats'],
  { revalidate: 600 }
);


export async function logSiteVisit() {
    try {
        await adminDb.collection('siteVisits').add({
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error logging site visit:", error);
    }
}
