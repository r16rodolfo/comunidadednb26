
-- Create market_analyses table
CREATE TABLE public.market_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    recommendation TEXT NOT NULL CHECK (recommendation IN ('ideal', 'alert', 'not-ideal', 'wait')),
    dollar_price NUMERIC NOT NULL,
    dollar_variation NUMERIC NOT NULL DEFAULT 0,
    euro_price NUMERIC NOT NULL,
    euro_variation NUMERIC NOT NULL DEFAULT 0,
    summary TEXT NOT NULL,
    full_analysis TEXT NOT NULL,
    video_url TEXT,
    image_url TEXT,
    supports NUMERIC[] NOT NULL DEFAULT '{}',
    resistances NUMERIC[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_analyses ENABLE ROW LEVEL SECURITY;

-- Public read: all authenticated users can view analyses
CREATE POLICY "Anyone can view analyses"
ON public.market_analyses FOR SELECT
USING (true);

-- Admin CRUD
CREATE POLICY "Admins can insert analyses"
ON public.market_analyses FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update analyses"
ON public.market_analyses FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete analyses"
ON public.market_analyses FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Gestor CRUD
CREATE POLICY "Gestors can insert analyses"
ON public.market_analyses FOR INSERT
WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Gestors can update analyses"
ON public.market_analyses FOR UPDATE
USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Gestors can delete analyses"
ON public.market_analyses FOR DELETE
USING (has_role(auth.uid(), 'gestor'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_market_analyses_updated_at
BEFORE UPDATE ON public.market_analyses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing mock data
INSERT INTO public.market_analyses (date, recommendation, dollar_price, dollar_variation, euro_price, euro_variation, summary, full_analysis, video_url, image_url, supports, resistances)
VALUES
(
    '2024-01-17',
    'wait',
    5.59,
    -0.35,
    6.44,
    -0.67,
    'Dólar em baixa mas cenário lateral mantido',
    'O dólar fechou em baixa de -0,35% nessa quinta, 17, após chega a subir 0,75% na máxima do dia. A baixa de hoje, influenciada pelas negociações sobre a taxa de 50% dos EUA, anima, mas não muda o cenário. Ainda estamos lateral. É o 6º pregão entre R$5,55 e R$5,63 Para baixo há suporte em R$5,52 e R$5,50. Para cima, R$5,63 e R$5,80. O Euro também recuou 0,67% a R$6,44. Cenário similar. Amanhã avaliaremos novas recomendações.',
    'https://example.com/video-latest',
    'https://example.com/chart-latest.png',
    ARRAY[5.50, 5.52],
    ARRAY[5.63, 5.80]
),
(
    '2024-01-16',
    'alert',
    5.63,
    0.71,
    6.48,
    0.45,
    'Dólar em alta, atenção aos níveis de resistência',
    'O dólar subiu 0,71% hoje, testando novamente o nível de R$5,63. Movimento influenciado por incertezas políticas domésticas. Mantenha atenção aos níveis de resistência em R$5,63 e R$5,80. Volume de negociações aumentou significativamente.',
    NULL,
    NULL,
    ARRAY[5.55, 5.50],
    ARRAY[5.63, 5.80]
),
(
    '2024-01-15',
    'ideal',
    5.55,
    -1.2,
    6.42,
    -0.8,
    'Momento favorável para compra com dólar em baixa',
    'Excelente oportunidade de compra com dólar recuando para R$5,55. Movimento técnico importante com rompimento de suporte. Recomendamos aproveitar este nível para posições cambiais.',
    'https://example.com/video1',
    'https://example.com/chart1.png',
    ARRAY[5.50, 5.45],
    ARRAY[5.60, 5.65]
);
