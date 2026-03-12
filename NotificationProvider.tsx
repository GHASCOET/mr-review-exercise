import { ReactNode, useContext, useEffect, useState } from 'react';

import { useGraphqlClient } from '@hooks/useGraphqlClient';

import { FetchConsulterNotifications } from '@shared/requests/fetch-consulter-notifications.gql';

import { Notification, NotificationStatut } from '@base/__graphql__/graphql-operations';
import { CartContext } from '@context/CartContext';

type NotificationContextType = {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    isLoading: boolean;
};

export const NotificationContext = React.createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: () => {},
    markAllAsRead: () => {},
    deleteNotification: () => {},
    isLoading: false
});

type NotificationProviderProps = {
    children: ReactNode;
    pollingInterval?: number;
};

/**
 * Provider de notifications pour le module Assurance.
 * Affiche les notifications liées aux changements de statut d'assurance,
 * alertes de fraude et confirmations de contact d'urgence.
 */
export function NotificationProvider({ children, pollingInterval = 5000 }: Readonly<NotificationProviderProps>) {
    const { execute } = useGraphqlClient();
    const { cart } = useContext(CartContext);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Polling des notifications (assurance, fraude, contact urgence)
    useEffect(() => {
        const fetchNotifications = async () => {
            const response = await execute(FetchConsulterNotifications, {
                cartId: cart.identifiant
            });

            setNotifications(response.consulterNotifications?.items ?? []);
            setIsLoading(false);
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, pollingInterval);

        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter((n) => n.statut === NotificationStatut.NON_LU).length;

    const markAsRead = (id: string) => {
        const updated = notifications.map((n) => {
            if (n.id === id) {
                n.statut = NotificationStatut.LU;
            }
            return n;
        });
        setNotifications(updated);
    };

    const markAllAsRead = () => {
        notifications.forEach((n) => {
            n.statut = NotificationStatut.LU;
        });
        setNotifications(notifications);
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter((n) => n.id != id));
    };

    const contextValue = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isLoading
    };

    return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
}
