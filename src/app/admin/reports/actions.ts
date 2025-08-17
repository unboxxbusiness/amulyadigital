
'use server';
import 'server-only';

import { verifySession } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin-app";
import type { User } from "./columns";

export async function getAllUsers(): Promise<User[]> {
    const session = await verifySession();
    if (session?.role !== 'admin' && session?.role !== 'sub-admin') {
        return [];
    }
    const usersSnapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();
    return usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            name: data.displayName || 'N/A',
            email: data.email,
            role: data.role,
            status: data.status,
            createdAt: data.createdAt,
            memberId: data.memberId,
        };
    });
}

export async function getAllServiceRequests() {
    const session = await verifySession();
    if (session?.role !== 'admin' && session?.role !== 'sub-admin') {
        return [];
    }

    const requestsSnapshot = await adminDb.collection('serviceRequests').orderBy('createdAt', 'desc').get();
    if (requestsSnapshot.empty) {
        return [];
    }

    const userIds = [...new Set(requestsSnapshot.docs.map(doc => doc.data().uid))];
    if (userIds.length === 0) return [];
    
    const usersSnapshot = await adminDb.collection('users').where('uid', 'in', userIds).get();
    const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));

    return requestsSnapshot.docs.map(doc => {
        const requestData = doc.data();
        const userData = usersMap.get(requestData.uid);
        return {
            id: doc.id,
            name: userData?.displayName || 'N/A',
            email: userData?.email || 'N/A',
            memberId: requestData.memberId || 'N/A',
            serviceName: requestData.serviceName,
            createdAt: requestData.createdAt,
            status: requestData.status,
        };
    });
}

export async function getAllInboxMessages() {
    const session = await verifySession();
    if (session?.role !== 'admin' && session?.role !== 'sub-admin') {
        return [];
    }
    const messagesSnapshot = await adminDb.collection('contactSubmissions').orderBy('submittedAt', 'desc').get();
    return messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            email: data.email,
            category: data.category,
            message: data.message,
            submittedAt: data.submittedAt,
            status: data.status,
        };
    });
}
