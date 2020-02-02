#include "ConsoleRender.h"
#include <iostream>

_CR g_cr;

CR createCR(int w, int h)
{
	g_cr.w = w;
	g_cr.h = h;
	g_cr.p = (char*)malloc((g_cr.w * 2 + 5) * (g_cr.h + 2));

	char* q = g_cr.p;

	//Set top border
	memcpy(q, "©³", 2); q += 2;
	for (int i = 0; i < g_cr.w; ++i)
	{
		memcpy(q, "©¥", 2); q += 2;
	}
	memcpy(q, "©·", 2); q += 2;
	*q = '\n'; q += 1;

	//Set mid
	for (int i = 0; i < g_cr.h; ++i)
	{
		memcpy(q, "©§", 2); q += 2 + g_cr.w * 2;
		memcpy(q, "©§", 2); q += 2;
		*q = '\n'; q += 1;
	}

	//Set bottom border
	memcpy(q, "©»", 2); q += 2;
	for (int i = 0; i < g_cr.w; ++i)
	{
		memcpy(q, "©¥", 2); q += 2;
	}
	memcpy(q, "©¿", 2); q += 2;
	*q = 0; //string terminator

	//Clear
	clearCR(&g_cr);

	return &g_cr;
}

void clearCR(CR cr)
{
	char* q = cr->p + (cr->w * 2 + 5) + 2;
	for (int i = 0; i < cr->h; ++i)
	{
		for (int j = 0; j < cr->w * 2; ++j)
			q[j] = ' ';
		q += cr->w * 2 + 5;
	}
}

bool setCR(CR cr, int x, int y, char* s)
{
	if (x < 0 || x >= cr->w || y < 0 || y >= cr->h || !s)
		return false;

	if (strlen(s) > (cr->w - x) * 2)
		return false;

	char* q = cr->p + (cr->w * 2 + 5) + 2;

	memcpy(q + y * (cr->w * 2 + 5) + x * 2, s, strlen(s));

	return 1;
}

void renderCR(CR cr)
{
	std::cout<<cr->p;
}

void destroyCR(CR cr)
{
	free(cr->p);
}