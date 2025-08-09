interface PageContainerProps {
    title: string
    subtitle?: string
    icon?: React.ReactNode
    children: React.ReactNode
}

const PageContainer = ({ title, subtitle, icon, children }: PageContainerProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                {icon && (
                    <div className="rounded-md p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-lg font-semibold">{title}</h1>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
            </div>
            {children}
        </div>
    )
}

export default PageContainer
