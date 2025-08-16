
'use server';

import { verifySession } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin-app";

type UserData = {
    uid: string;
    displayName: string;
    email: string;
    status: string;
    memberId: string;
    lifetimeStatus: string;
    lifetimeExpiry?: string;
    paymentTransactionId?: string;
}

type ServiceRequest = {
    id: string;
    serviceName: string;
    status: string;
    createdAt: string;
    [key: string]: any;
}

export async function getDashboardData(): Promise<{ user: UserData | null, serviceRequests: ServiceRequest[] }> {
    const session = await verifySession();
    if (!session?.uid) {
        return { user: null, serviceRequests: [] };
    }

    try {
        const userDocRef = adminDb.collection('users').doc(session.uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return { user: null, serviceRequests: [] };
        }

        const userData = userDoc.data() as UserData;
        
        const serviceRequestsSnapshot = await adminDb.collection('serviceRequests')
            .where('uid', '==', session.uid)
            .orderBy('createdAt', 'desc')
            .get();

        const serviceRequests: ServiceRequest[] = serviceRequestsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        } as ServiceRequest));

        return {
            user: {
                uid: userData.uid,
                displayName: userData.displayName || '',
                email: userData.email || '',
                status: userData.status || '',
                memberId: userData.memberId || '',
                lifetimeStatus: userData.lifetimeStatus || 'not_applied',
                lifetimeExpiry: userData.lifetimeExpiry || '',
                paymentTransactionId: userData.paymentTransactionId || '',
            },
            serviceRequests,
        };

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return { user: null, serviceRequests: [] };
    }
}
