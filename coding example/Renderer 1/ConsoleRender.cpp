#include "ConsoleRender.h"
#include <iostream>

CR createCR(int w, int h)
{
	w += 2;
	h += 2;
	CR cr = (CR)malloc(sizeof(_CR) * w * h);
	cr->w = w;
	cr->h = h;

	clearCR(cr);

	return cr;
}

void clearCR(CR cr)
{
	cr[0].p = "©³"; 
	for (int i = 1; i < cr->w - 1; ++i)
		cr[i].p = "©¥";
	cr[cr->w - 1].p = "©·";

	for (int i = 1; i < cr->h - 1; ++i)
	{
		for (int j = 0; j < cr->w; ++j)
		{
			if (j == 0 || j == cr->w - 1)
				cr[j + i * cr->w].p = "©§";
			else
				cr[j + i * cr->w].p = "  ";
		}
	}

	cr[cr->w * (cr->h - 1)].p = "©»";
	for (int i = cr->w * (cr->h - 1) + 1; i < cr->w * cr->h - 1; ++i)
		cr[i].p = "©¥";
	cr[cr->w * cr->h - 1].p = "©¿";
}

bool setCR(CR cr, int x, int y, char* s)
{
	cr[x + y * cr->w].p = s;
	return true;
}

void renderCR(CR cr)
{
	for (int i = 0; i < cr->h; ++i)
	{
		for (int j = 0; j < cr->w; ++j)
			std::cout<<cr[j + i * cr->w].p;
		std::cout<<std::endl;
	}
}

void destroyCR(CR cr)
{
	free(cr);
}